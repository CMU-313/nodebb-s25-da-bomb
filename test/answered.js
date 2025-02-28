'use strict';

const path = require('path');
const assert = require('assert');
const validator = require('validator');
const mockdate = require('mockdate');
const nconf = require('nconf');
const util = require('util');

const sleep = util.promisify(setTimeout);

const db = require('./mocks/databasemock');
const file = require('../src/file');
const topics = require('../src/topics');
const posts = require('../src/posts');
const categories = require('../src/categories');
const privileges = require('../src/privileges');
const meta = require('../src/meta');
const User = require('../src/user');
const groups = require('../src/groups');
const utils = require('../src/utils');
const helpers = require('./helpers');
const socketTopics = require('../src/socket.io/topics');
const apiTopics = require('../src/api/topics');
const apiPosts = require('../src/api/posts');
const request = require('../src/request');


const answered = async function (pid, uid) {
	try {
		privileges.posts.can('posts:answered', pid, uid);
	} catch (e) { }
	return { answered: true };
};

describe('Categorize questions as Answered', () => {
	let topicAnswered;
	let topicUnanswered;
	let categoryAnswered;
	let categoryUnanswered;
	let testUid;
	let fooUid;
	let adminJar;
	let csrf_token;

	// modified from ./topics.js
	before(async () => {
		testUid = await User.create({ username: 'test', password: 'password' });
		fooUid = await User.create({ username: 'foo' });
		await groups.join('administrators', testUid);
		const adminLogin = await helpers.loginUser('test', 'password');
		adminJar = adminLogin.jar;
		csrf_token = adminLogin.csrf_token;
		categoryAnswered = await categories.create({
			name: 'Answered Category',
			description: 'Answered category created by testing script',
		});
		categoryUnanswered = await categories.create({
			name: 'Unanswered Category',
			description: 'Unanswered category created by testing script',
		});
		topicAnswered = {
			userId: testUid,
			categoryId: categoryAnswered.cid,
			title: 'Test Answered',
			content: 'Post has been answered',
		};
		topicUnanswered = {
			userId: testUid,
			categoryId: categoryUnanswered.cid,
			title: 'Test Unanswered',
			content: 'Post has been unanswered',
		};
	});

	it('should categorize a topic as answered', (done) => {
		topics.post({
			uid: topicAnswered.userId,
			title: topicAnswered.title,
			content: topicAnswered.content,
			cid: topicAnswered.categoryId,
		}, (err, result) => {
			assert.ifError(err);
			assert(result);
			topicAnswered.tid = result.topicData.tid;
			done();
		});
	});
	it('should categorize a topic as unanswered', (done) => {
		topics.post({
			uid: topicUnanswered.userId,
			title: topicUnanswered.title,
			content: topicUnanswered.content,
			cid: topicUnanswered.categoryId,
		}, (err, result) => {
			assert.ifError(err);
			assert(result);
			topicUnanswered.tid = result.topicData.tid;
			done();
		});
	});
});
