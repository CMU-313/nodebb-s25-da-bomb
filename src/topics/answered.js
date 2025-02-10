'use strict';

const _ = require('lodash');

const db = require('../database');
const user = require('../user');
const categories = require('../categories');
const privileges = require('../privileges');
const plugins = require('../plugins');


module.exports = function (Topics) {
	Topics.markAsAnswered = async function (uid, tid) {
		const topicData = await Topics.getTopicFields(tid, ['answered']);
		if (!topicData || !topicData.cid) {
			throw new Error('[[error:no-topic]]');
		}
		// function from ../data.js
		await Topics.setTopicField(tid, 'answered', 1);
		plugins.hooks.fire('action:topic.answered', { tid: tid, uid: uid });
		return topicData;
	};
	Topics.markAsUnanswered = async function (uid, tid) {
		const topicData = await Topics.getTopicFields(tid, ['answered']);
		if (!topicData || !topicData.cid) {
			throw new Error('[[error:no-topic]]');
		}

		await Topics.setTopicField(tid, 'answered', 0);
		plugins.hooks.fire('action:topic.answered', { tid: tid, uid: uid });
		return topicData;
	};
	// based on getUnread functions from ../unread.js
	Topics.getUnansweredTopics = async function (params) {
		const unansweredTopics = {
			showSelect: true,
			nextStart: 0,
			topics: [],
		};
		let tids = await Topics.getUnansweredTids(params);
		unansweredTopics.topicCount = tids.length;

		if (!tids.length) {
			return unansweredTopics;
		}

		tids = tids.slice(params.start, params.stop !== -1 ? params.stop + 1 : undefined);

		const topicData = await Topics.getTopicsByTids(tids, params.uid);
		if (!topicData.length) {
			return unansweredTopics;
		}
		Topics.calculateTopicIndices(topicData, params.start);
		unansweredTopics.topics = topicData;
		unansweredTopics.nextStart = params.stop + 1;
		return unansweredTopics;
	};
	Topics.getUnAnsweredTids = async function (params) {
		const results = await Topics.getAnsweredData(params);
		return params.count ? results.counts : results.tids;
	};
	Topics.getAnsweredData = async function (params) {
		const uid = parseInt(params.uid, 10);

		params.filter = params.filter || '';

		if (params.cid && !Array.isArray(params.cid)) {
			params.cid = [params.cid];
		}

		if (params.tag && !Array.isArray(params.tag)) {
			params.tag = [params.tag];
		}

		const data = await getTids(params);
		if (uid <= 0) {
			return data;
		}

		const result = await plugins.hooks.fire('filter:topics.getAnsweredTids', {
			uid: uid,
			tids: data.tids,
			counts: data.counts,
			tidsByFilter: data.tidsByFilter,
			answeredCids: data.answeredCids,
			cid: params.cid,
			filter: params.filter,
			query: params.query || {},
		});
		return result;
	};
	// from unread.js
	async function getTids(params) {
		const counts = { '': 0, new: 0, watched: 0, unreplied: 0 };
		const tidsByFilter = { '': [], new: [], watched: [], unreplied: [] };
		const unreadCids = [];
		if (params.uid <= 0) {
			return { counts, tids: [], tidsByFilter, unreadCids };
		}

		params.cutoff = await Topics.unreadCutoff(params.uid);

		const [followedTids, userScores, tids_unread] = await Promise.all([
			getFollowedTids(params),
			db.getSortedSetRevRangeByScoreWithScores(`uid:${params.uid}:tids_read`, 0, -1, '+inf', params.cutoff),
			db.getSortedSetRevRangeWithScores(`uid:${params.uid}:tids_unread`, 0, -1),
		]);

		const userReadTimes = _.mapValues(_.keyBy(userScores, 'value'), 'score');
		const isTopicsFollowed = {};
		followedTids.forEach((t) => {
			isTopicsFollowed[t.value] = true;
		});
		const unreadFollowed = await db.isSortedSetMembers(
			`uid:${params.uid}:followed_tids`, tids_unread.map(t => t.value)
		);

		tids_unread.forEach((t, i) => {
			isTopicsFollowed[t.value] = unreadFollowed[i];
		});

		const blockedUids = await user.blocks.list(params.uid);

		tids = await privileges.topics.filterTids('topics:read', tids, params.uid);
		const topicData = (await Topics.getTopicsFields(tids, ['tid', 'cid', 'uid', 'postcount', 'deleted', 'scheduled', 'tags']))
			.filter(t => t.scheduled || !t.deleted);
		const topicCids = _.uniq(topicData.map(topic => topic.cid)).filter(Boolean);

		const categoryWatchState = await categories.getWatchState(topicCids, params.uid);
		const userCidState = _.zipObject(topicCids, categoryWatchState);

		const filterCids = params.cid && params.cid.map(cid => parseInt(cid, 10));
		const filterTags = params.tag && params.tag.map(tag => String(tag));

		topicData.forEach((topic) => {
			if (topic && topic.cid &&
				(!filterCids || filterCids.includes(topic.cid)) &&
				(!filterTags || filterTags.every(tag => topic.tags.find(topicTag => topicTag.value === tag))) &&
				!blockedUids.includes(topic.uid)) {
				if (isTopicsFollowed[topic.tid] ||
					[categories.watchStates.watching, categories.watchStates.tracking].includes(userCidState[topic.cid])) {
					tidsByFilter[''].push(topic.tid);
					unreadCids.push(topic.cid);
				}

				if (isTopicsFollowed[topic.tid]) {
					tidsByFilter.watched.push(topic.tid);
				}

				if (topic.postcount <= 1) {
					tidsByFilter.unreplied.push(topic.tid);
				}

				if (!userReadTimes[topic.tid]) {
					tidsByFilter.new.push(topic.tid);
				}
			}
		});

		counts[''] = tidsByFilter[''].length;
		counts.watched = tidsByFilter.watched.length;
		counts.unreplied = tidsByFilter.unreplied.length;
		counts.new = tidsByFilter.new.length;

		return {
			counts: counts,
			tids: tidsByFilter[params.filter],
			tidsByFilter: tidsByFilter,
			unreadCids: unreadCids,
		};
	}
	async function getFollowedTids(params) {
		const keys = params.cid ?
			params.cid.map(cid => `cid:${cid}:tids:lastposttime`) :
			'topics:recent';

		const recentTopicData = await db.getSortedSetRevRangeByScoreWithScores(keys, 0, -1, '+inf', params.cutoff);
		const isFollowed = await db.isSortedSetMembers(`uid:${params.uid}:followed_tids`, recentTopicData.map(t => t.tid));
		return recentTopicData.filter((t, i) => isFollowed[i]);
	}
};
