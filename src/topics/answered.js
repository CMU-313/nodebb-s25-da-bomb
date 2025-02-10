'use strict';

const topics = require('../topics');
const plugins = require('../plugins');


module.exports = function (Topics) {
	Topics.markAsAnswered = async function (tids, uid) {
		if (!Array.isArray(tids) || !tids.length) {
			return false;
		}

		tids = _.uniq(tids).filter(tid => tid && utils.isNumber(tid));

		if (!tids.length) {
			return false;
		}

		const topicData = await Topics.getTopicFields(tid, ['answered']);
		if (!topicData || !topicData.cid) {
			throw new Error('[[error:no-topic]]');
		}

		// function from ../data.js
		await Topics.setTopicField(tid, 'answered', 1);
		plugins.hooks.fire('action:topic.answered', { topic: _.clone(topicData), uid: uid });
		return topicData;
			
	};

	Topics.markAsUnanswered = async function (uid, tid) {
		if (!Array.isArray(tids) || !tids.length) {
			return false;
		}

		tids = _.uniq(tids).filter(tid => tid && utils.isNumber(tid));

		if (!tids.length) {
			return false;
		}

		const topicData = await Topics.getTopicFields(tid, ['answered']);
		if (!topicData || !topicData.cid) {
			throw new Error('[[error:no-topic]]');
		}

		await Topics.setTopicField(tid, 'answered', 0);
		plugins.hooks.fire('action:topic.answered', { topic: _.clone(topicData), uid: uid });
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
};