'use strict';

const assert = require('assert');
const Posts = require('../src/posts'); // This module should include your goodquestion methods
const topics = require('../src/topics');
const user = require('../src/user');
const db = require('../src/database');
const privileges = require('../src/privileges');

/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-undef */

describe('Good Question Feature (Direct Function Calls)', function () {
	let voterUid; let voteeUid; let postData; let topicData;
	const cid = 1; // Adjust cid as needed

	before(async function () {
		// Create two users: one who will mark and one who will be marked
		voterUid = await user.create({ username: 'goodquestioner' });
		voteeUid = await user.create({ username: 'goodquestioned' });
		// Create a topic/post by the votee
		const result = await topics.post({
			uid: voteeUid,
			cid,
			title: 'Good Question Test Topic',
			content: 'This post is for testing the good question feature.',
		});
		topicData = result.topicData;
		postData = result.postData;
	});

	it('should mark a post as good question', async function () {
		// Call the underlying function to mark the post as a good question
		const result = await Posts.goodquestion(postData.pid, voterUid);
		// Ensure the response flag is true
		assert.strictEqual(result.goodquestion, true, 'Expected goodquestion flag to be true');
		// Check via helper method
		const status = await Posts.hasMarkedGood(postData.pid, voterUid);
		assert.strictEqual(status.goodquestion, true, 'Post should be marked as good question for the voter');
		// Verify that the goodquestion count on the post is updated
		const updatedPost = await Posts.getPostFields(postData.pid, ['goodquestions']);
		assert.strictEqual(Number(updatedPost.goodquestions), 1, 'Expected goodquestion count to be 1');
	});

	it('should record the pid in the goodquestion sorted set for the user', async function () {
		// Mark the post first
		await Posts.goodquestion(postData.pid, voterUid);
		// Verify that the sorted set for the user includes the pid
		const score = await db.sortedSetScore(`uid:${voterUid}:goodquestion`, postData.pid);
		assert.ok(score !== null, 'The sorted set should contain the post pid for goodquestion marks');
	});

	it('should unmark a good question', async function () {
		// Ensure the post is marked first
		await Posts.goodquestion(postData.pid, voterUid);
		// Unmark it using the corresponding function
		await Posts.ungoodquestion(postData.pid, voterUid);
		// Check that the flag is no longer set
		const status = await Posts.hasMarkedGood(postData.pid, voterUid);
		assert.strictEqual(status.goodquestion, false, 'Post should no longer be marked as good question');
		// Verify the goodquestion count is now 0
		const updatedPost = await Posts.getPostFields(postData.pid, ['goodquestions']);
		assert.strictEqual(Number(updatedPost.goodquestions), 0, 'Expected goodquestion count to be 0');
	});

	it('should not allow a user to mark their own post as good question', async function () {
		// Create a self-post by the same user who will attempt to mark it
		const result = await topics.post({
			uid: voterUid,
			cid,
			title: 'Self Post',
			content: 'I should not be able to mark my own post as good question.',
		});
		const { postData: selfPostData } = result;
		let err;
		try {
			await Posts.goodquestion(selfPostData.pid, voterUid);
		} catch (e) {
			err = e;
		}
		assert.ok(err, 'Expected an error when marking one’s own post as good question');
	});
});
