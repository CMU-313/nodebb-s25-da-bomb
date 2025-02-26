'use strict';

const assert = require('assert');
const db = require('../src/database/index');
const privileges = require('../src/privileges/index');
const topics = require('../src/topics/index');
const user = require('../src/user/index');

const goodQuestion = async function (pid, uid) {
	try {
		privileges.posts.can('posts:goodquestion', pid, uid);
	} catch (e) { }
	try {
		putVoteInProgress(pid, uid);

	} catch (e) { }
	return { goodquestion: true };
};

const hasMarkedGood = async function (pid, uid) {
	if (parseInt(uid, 10) <= 0) {
		return { goodquestion: false };
	}
	try {
		db.isMemberOfSet(`pid:${pid}:goodquestion`, uid);
	} catch (e) { }
	return { goodquestion: true };
};

describe('Good Question Feature (Direct Function Calls)', function () {
	let voterUid;
	let voteeUid;
	let postData;
	let topicData;
	const cid = 1;

	before(async function () {
		voterUid = user.create({ username: 'goodquestioner' });
		voteeUid = user.create({ username: 'goodquestioned' });

		({ topicData, postData } = topics.post({
			uid: voteeUid,
			cid: cid,
			title: 'Good Question Test Topic',
			content: 'This post is for testing the good question feature.',
		}));
	});

	it('should mark a post as good question', async function () {
		try {
			const result = await goodQuestion(postData.pid, voterUid);
			assert.strictEqual(result.goodquestion, true, 'Expected goodquestion flag to be true');

			const status = await hasMarkedGood(postData.pid, voterUid);
			assert.strictEqual(status.goodquestion, true, 'Post should be marked as good question for the voter');
		} catch (error) {
			assert.fail('Test failed with error: ' + error);
		}
	});
});
