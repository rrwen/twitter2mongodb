// Richard Wen
// rrwen.dev@gmail.com

require('dotenv').config();

// (packages) Package dependencies
var fs = require('fs');
var moment = require('moment');
var twitter2mongodb = require('../index.js');
var test = require('tape');

const Client = require('mongodb').MongoClient;

// (test_info) Get package metadata
var json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
var testedPackages = [];
for (var k in json.dependencies) {
	testedPackages.push(k + ' (' + json.dependencies[k] + ')');
}
var devPackages = [];
for (var k in json.devDependencies) {
	devPackages.push(k + ' (' + json.devDependencies[k] + ')');
}

// (test_log) Pipe tests to file and output
if (!fs.existsSync('./tests/log')){
	fs.mkdirSync('./tests/log');
}
var testFile = './tests/log/test_' + json.version.split('.').join('_') + '.txt';
test.createStream().pipe(fs.createWriteStream(testFile));
test.createStream().pipe(process.stdout);

// (test) Run tests
test('Tests for ' + json.name + ' (' + json.version + ')', t => {
	t.comment('Node.js (' + process.version + ')');
	t.comment('Description: ' + json.description);
	t.comment('Date: ' + moment().format('YYYY-MM-DD hh:mm:ss'));
	t.comment('Dependencies: ' + testedPackages.join(', '));
	t.comment('Developer: ' + devPackages.join(', '));
	
	// (test_connect) Connect to test database
	Client.connect(process.env.MONGODB_CONNECTION)
		.then(client => {
			t.pass('(MAIN) MongoDB connect');
			t.comment('(A) tests on Twitter REST API');
			
			// (test_get_insertone) Insert searched tweets as one object
			return twitter2mongodb({
				twitter: {
					method: 'get',
					path: 'search/tweets',
					params: {q: 'twitter'}
				},
				mongodb: {method: 'insertOne'}
			})
				.then(data => {
					return data.mongodb.collection.find({}).toArray()
						.then(docs => {
							var actual = [data.twitter.tweets];
							var expected = docs;
							t.deepEquals(actual, expected, '(A) GET search/tweets to insertOne');
						});
				})
				.catch(err => {
					t.fail('(A) GET search/tweets to insertOne: ' + err.message);
				});
		})
		.catch(err => {
			t.fail('(MAIN) MongoDB connect: ' + err.message);
		})
		.then(() => {
			
			// (test_drop) Drop database
			Client.connect(process.env.MONGODB_CONNECTION, function(err, client) {
				if (err) {
					t.fail('(MAIN) MongoDB drop database: ' + err.message);
					process.exit(1);
				}
				var db = client.db(process.env.MONGODB_DATABASE);
				db.dropDatabase((err, res) => {
					if (err) {
						t.fail('(MAIN) MongoDB drop database: ' + err.message);
						process.exit(1);
					}
					t.pass('(MAIN) MongoDB drop database');
					process.exit(0);
				});
			});
		});
	t.end();
});
