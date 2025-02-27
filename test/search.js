'use strict';


const assert = require('assert');
const nconf = require('nconf');

const db = require('./mocks/databasemock');
const topics = require('../src/topics');
const categories = require('../src/categories');
const user = require('../src/user');
const search = require('../src/search');
const privileges = require('../src/privileges');
const request = require('../src/request');

describe('Search', () => {
	let phoebeUid;
	let gingerUid;

	let topic1Data;
	let topic2Data;
	let post1Data;
	let post2Data;
	let post3Data;
	let cid1;
	let cid2;
	let cid3;

	let aliceUid;
	let bobUid;

	let newCategory1;
	let newCategory2;
	let newTopicData;
	let newPostData;

	before(async () => {
		phoebeUid = await user.create({ username: 'phoebe' });
		gingerUid = await user.create({ username: 'ginger' });
		cid1 = (await categories.create({
			name: 'Test Category',
			description: 'Test category created by testing script',
		})).cid;

		cid2 = (await categories.create({
			name: 'Test Category',
			description: 'Test category created by testing script',
		})).cid;

		cid3 = (await categories.create({
			name: 'Child Test Category',
			description: 'Test category created by testing script',
			parentCid: cid2,
		})).cid;

		({ topicData: topic1Data, postData: post1Data } = await topics.post({
			uid: phoebeUid,
			cid: cid1,
			title: 'nodebb mongodb bugs',
			content: 'avocado cucumber apple orange fox',
			tags: ['nodebb', 'bug', 'plugin', 'nodebb-plugin', 'jquery'],
		}));

		({ topicData: topic2Data, postData: post2Data } = await topics.post({
			uid: gingerUid,
			cid: cid2,
			title: 'java mongodb redis',
			content: 'avocado cucumber carrot armadillo',
			tags: ['nodebb', 'bug', 'plugin', 'nodebb-plugin', 'javascript'],
		}));
		post3Data = await topics.reply({
			uid: phoebeUid,
			content: 'reply post apple',
			tid: topic2Data.tid,
		});

		// Create new users
		aliceUid = await user.create({ username: 'alice' });
		bobUid = await user.create({ username: 'bob' });

		// Create new categories
		newCategory1 = (await categories.create({
			name: 'New Test Category 1',
			description: 'A new test category for search testing',
		})).cid;

		newCategory2 = (await categories.create({
			name: 'New Test Category 2',
			description: 'Another new test category for search testing',
		})).cid;

		// Create a new topic and post in the new category
		({ topicData: newTopicData, postData: newPostData } = await topics.post({
			uid: aliceUid,
			cid: newCategory1,
			title: 'Test topic for search',
			content: 'This is a test post content with unique words like pineapple and mango',
			tags: ['test', 'search'],
		}));
	});

	it('should search term in titles and posts', async () => {
		const meta = require('../src/meta');
		const qs = `/api/search?term=cucumber&in=titlesposts&categories[]=${cid1}&by=phoebe&replies=1&repliesFilter=atleast&sortBy=timestamp&sortDirection=desc&showAs=posts`;
		await privileges.global.give(['groups:search:content'], 'guests');

		const { body } = await request.get(nconf.get('url') + qs);
		assert(body);
		assert.equal(body.matchCount, 1);
		assert.equal(body.posts.length, 1);
		assert.equal(body.posts[0].pid, post1Data.pid);
		assert.equal(body.posts[0].uid, phoebeUid);

		await privileges.global.rescind(['groups:search:content'], 'guests');
	});

	it('should search for a user', (done) => {
		search.search({
			query: 'gin',
			searchIn: 'users',
		}, (err, data) => {
			assert.ifError(err);
			assert(data);
			assert.equal(data.matchCount, 1);
			assert.equal(data.users.length, 1);
			assert.equal(data.users[0].uid, gingerUid);
			assert.equal(data.users[0].username, 'ginger');
			done();
		});
	});

	it('should search for a tag', (done) => {
		search.search({
			query: 'plug',
			searchIn: 'tags',
		}, (err, data) => {
			assert.ifError(err);
			assert(data);
			assert.equal(data.matchCount, 1);
			assert.equal(data.tags.length, 1);
			assert.equal(data.tags[0].value, 'plugin');
			assert.equal(data.tags[0].score, 2);
			done();
		});
	});

	it('should search for a category', async () => {
		await categories.create({
			name: 'foo category',
			description: 'Test category created by testing script',
		});
		await categories.create({
			name: 'baz category', 
			description: 'Test category created by testing script',
		});
		const result = await search.search({
			query: 'baz',
			searchIn: 'categories',
		});
		assert.strictEqual(result.matchCount, 1);
		assert.strictEqual(result.categories[0].name, 'baz category');
	});

	it('should search for multiple categories', async () => {
		await categories.create({
			name: 'test category',
			description: 'Another test category',
		});
		await categories.create({
			name: 'test category 2',
			description: 'Another test category',
		});
		const result = await search.search({
			query: 'test',
			searchIn: 'categories',
		});
		assert.strictEqual(result.matchCount, 7);
		assert(result.categories.some(c => c.name === 'test category'));
		assert(result.categories.some(c => c.name === 'test category 2'));
	});

	it('should return empty results for non-existent category', async () => {
		const result = await search.search({
			query: 'non-existent-category-name',
			searchIn: 'categories',
		});
		assert.strictEqual(result.matchCount, 0);
		assert.strictEqual(result.categories.length, 0);
	});

	it('should search for categories', async () => {
		const socketCategories = require('../src/socket.io/categories');
		let data = await socketCategories.categorySearch({ uid: phoebeUid }, { query: 'baz', parentCid: 0 });
		console.log('data:', data);
		assert.strictEqual(data[0].name, 'test category 2');
		data = await socketCategories.categorySearch({ uid: phoebeUid }, { query: '', parentCid: 0 });
		assert.strictEqual(data.length, 9);
	});

	it('should fail if searchIn is wrong', (done) => {
		search.search({
			query: 'plug',
			searchIn: '',
		}, (err) => {
			assert.equal(err.message, '[[error:unknown-search-filter]]');
			done();
		});
	});

	it('should search with tags filter', (done) => {
		search.search({
			query: 'mongodb',
			searchIn: 'titles',
			hasTags: ['nodebb', 'javascript'],
		}, (err, data) => {
			assert.ifError(err);
			assert.equal(data.posts[0].tid, topic2Data.tid);
			done();
		});
	});

	it('should not crash if tags is not an array', (done) => {
		search.search({
			query: 'mongodb',
			searchIn: 'titles',
			hasTags: 'nodebb,javascript',
		}, (err, data) => {
			assert.ifError(err);
			done();
		});
	});

	it('should not find anything', (done) => {
		search.search({
			query: 'xxxxxxxxxxxxxx',
			searchIn: 'titles',
		}, (err, data) => {
			assert.ifError(err);
			assert(Array.isArray(data.posts));
			assert(!data.matchCount);
			done();
		});
	});

	it('should search child categories', async () => {
		await topics.post({
			uid: gingerUid,
			cid: cid3,
			title: 'child category topic',
			content: 'avocado cucumber carrot armadillo',
		});
		const result = await search.search({
			query: 'avocado',
			searchIn: 'titlesposts',
			categories: [cid2],
			searchChildren: true,
			sortBy: 'topic.timestamp',
			sortDirection: 'desc',
		});
		assert(result.posts.length, 2);
		assert(result.posts[0].topic.title === 'child category topic');
		assert(result.posts[1].topic.title === 'java mongodb redis');
	});

	it('should return json search data with no categories', async () => {
		const qs = '/api/search?term=cucumber&in=titlesposts&searchOnly=1';
		await privileges.global.give(['groups:search:content'], 'guests');

		const { body } = await request.get(nconf.get('url') + qs);
		assert(body);
		assert(body.hasOwnProperty('matchCount'));
		assert(body.hasOwnProperty('pagination'));
		assert(body.hasOwnProperty('pageCount'));
		assert(body.hasOwnProperty('posts'));
		assert(!body.hasOwnProperty('categories'));

		await privileges.global.rescind(['groups:search:content'], 'guests');
	});

	it('should not crash without a search term', async () => {
		const qs = '/api/search';
		await privileges.global.give(['groups:search:content'], 'guests');
		const { response, body } = await request.get(nconf.get('url') + qs);
		assert(body);
		assert.strictEqual(response.statusCode, 200);
		await privileges.global.rescind(['groups:search:content'], 'guests');
	});

	it('should search topics under specific categories', async () => {
		// Create test topics in different categories
		const topic3Data = await topics.post({
			uid: bobUid,
			cid: newCategory1,
			title: 'special unique topic',
			content: 'watermelon grape banana test',
		});

		const topic4Data = await topics.post({
			uid: aliceUid, 
			cid: newCategory2,
			title: 'another unique topic',
			content: 'kiwi strawberry banana test',
		});

		// Search in specific categories
		const result1 = await search.search({
			query: 'unique',
			searchIn: 'titlesposts',
			categories: [newCategory1],
			sortBy: 'topic.timestamp',
			sortDirection: 'desc',
		});

		console.log('result1:', result1);

		assert(result1.posts.length === 2);
		assert(result1.posts[0].topic.title === 'special unique topic');
		assert(result1.posts[0].topic.cid === newCategory1);

		// Search across multiple categories
		const result2 = await search.search({
			query: 'banana',
			searchIn: 'titlesposts', 
			categories: [newCategory1, newCategory2],
			sortBy: 'topic.timestamp',
			sortDirection: 'desc',
		});

		assert(result2.posts.length === 2);
		assert(result2.posts.some(post => post.topic.cid === newCategory1));
		assert(result2.posts.some(post => post.topic.cid === newCategory2));

		// Search with no results
		const result3 = await search.search({
			query: 'nonexistentterm',
			searchIn: 'titlesposts',
			categories: [newCategory1, newCategory2],
		});

		assert(result3.posts.length === 0);
	});
});
