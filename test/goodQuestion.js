'use strict';

const assert = require('assert');
const Posts = require('../src/posts');
const topics = require('../src/topics');
const user = require('../src/user');
const db = require('../src/database');
const privileges = require('../src/privileges');

/* eslint-disable prefer-arrow-callback */

describe('Good Question Feature (Direct Function Calls)', function () {
	let voterUid;
	let voteeUid;
	let postData;
	let topicData;
	const cid = 1;

	before(async function () {
		voterUid = await user.create({ username: 'goodquestioner' });
		voteeUid = await user.create({ username: 'goodquestioned' });

		({ topicData, postData } = await topics.post({
			uid: voteeUid,
			cid: cid,
			title: 'Good Question Test Topic',
			content: 'This post is for testing the good question feature.',
		}));
	});

	it('should mark a post as good question', async function () {
		const result = await Posts.goodquestion(postData.pid, voterUid);

		assert.strictEqual(result.goodquestion, true, 'Expected goodquestion flag to be true');

		const status = await Posts.hasMarkedGood(postData.pid, voterUid);
		assert.strictEqual(status.goodquestion, true, 'Post should be marked as good question for the voter');

		const updatedPost = await Posts.getPostFields(postData.pid, ['goodquestions']);
		assert.strictEqual(Number(updatedPost.goodquestions), 1, 'Expected goodquestion count to be 1');
	});

	it('should record the pid in the goodquestion sorted set for the user', async function () {
		await Posts.goodquestion(postData.pid, voterUid);

		const score = await db.sortedSetScore(`uid:${voterUid}:goodquestion`, postData.pid);
		assert.ok(score !== null, 'The sorted set should contain the post pid for goodquestion marks');
	});

	it('should unmark a good question', async function () {
		await Posts.goodquestion(postData.pid, voterUid);

		const result = await Posts.ungoodquestion(postData.pid, voterUid);

		const status = await Posts.hasMarkedGood(postData.pid, voterUid);
		assert.strictEqual(status.goodquestion, false, 'Post should no longer be marked as good question');

		const updatedPost = await Posts.getPostFields(postData.pid, ['goodquestions']);
		assert.strictEqual(Number(updatedPost.goodquestions), 0, 'Expected goodquestion count to be 0');
	});

	it('should not allow a user to mark their own post as good question', async function () {
		const selfPost = await topics.post({
			uid: voterUid,
			cid: cid,
			title: 'Self Post',
			content: 'I should not be able to mark my own post as good question.',
		});
		let err;
		try {
			await Posts.goodquestion(selfPost.postData.pid, voterUid);
		} catch (e) {
			err = e;
		}
		assert.ok(err, 'Expected an error when marking one’s own post as good question');
	});
});
