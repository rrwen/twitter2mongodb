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
	process.env.MONGODB_DATABASE = process.env.MONGODB_TESTDATABASE;
	
	// (test_connect) Connect to test database
	Client.connect(process.env.MONGODB_CONNECTION)
		.then(client => {
			
			// (test_connect_pass) Connection successful
			t.pass('(MAIN) MongoDB connect');
			t.comment('(A) tests on Twitter REST API');
			
			// (test_rest_insertone) Insert searched tweets as one object
			return twitter2mongodb({
				mongodb: {
					connection: process.env.MONGODB_CONNECTION,
					collection: process.env.MONGODB_COLLECTION,
					database: process.env.MONGODB_DATABASE,
					method_options: undefined,
					options: {poolsize: 5},
					check: function(tweets) {return(true)}
				},
				twitter: {
					method: 'get'
				}
			})
				.then(data => {
					
					// (test_rest_insertone_pass) Pass if consistent with database
					return data.mongodb.collection.find({}).toArray()
						.then(docs => {
							var actual = [data.twitter.tweets];
							var expected = docs;
							t.deepEquals(actual, expected, '(A) REST GET search/tweets to insertOne');
						});
				})
				.catch(err => {
					
					// (test_rest_insertone_fail) Fail if inconsistent with database or error
					t.fail('(A) REST GET search/tweets to insertOne: ' + err.message);
				});
		})
		.then(data => {
			
			// (test_rest_insertmany) Insert searched tweets as array filtering for statuses
			return twitter2mongodb({
				twitter: {
					method: 'get',
					path: 'search/tweets',
					params: {q: 'twitter'}
				},
				mongodb: {
					method: 'insertMany',
					collection: 'test_insertMany',
					options: '{"poolsize": 5}'
				},
				jsonata: 'statuses'
			})
				.then(data => {
					
					// (test_rest_insertmany_pass) Pass if consistent with database
					return data.mongodb.collection.find({}).toArray()
						.then(docs => {
							var actual = data.twitter.tweets;
							var expected = docs;
							t.deepEquals(actual, expected, '(A) REST GET search/tweets to insertMany');
							return data;
						});
				})
				.catch(err => {
					
					// (test_rest_insertmany_fail) Fail if inconsistent with database or error
					t.fail('(A) REST GET search/tweets to insertMany: ' + err.message);
				});
		})
		.then(data => {
			t.comment('(B) tests on Twitter Stream API')
			
			// (test_stream) Insert streamed tweet
			var stream = twitter2mongodb({
				twitter: {
					method: 'stream',
					path: 'statuses/filter',
					params: '{"track": "twitter"}'
				},
				mongodb: {
					method: 'insertOne',
					collection: 'test_stream'
				}
			});
			
			// (test_stream_pass) Pass if stream data arrives
			stream.on('data', tweets => {
				var collection = data.mongodb.db.collection('test_stream');
				collection.find({}).toArray()
					.then(docs => {
						t.pass('(B) STREAM POST statuses/filter to insertOne');
						
						// (test_drop) Drop database
						Client.connect(process.env.MONGODB_CONNECTION, function(err, client) {
							
							// (test_drop_fail) Unable to drop database due to connection
							if (err) {
								t.fail('(MAIN) MongoDB drop database: ' + err.message);
								process.exit(1);
							}
							
							// (test_drop_client) Drop database with client
							var db = client.db(process.env.MONGODB_DATABASE);
							db.dropDatabase((err, res) => {
								
								// (test_drop_fail2) Unable to drop database
								if (err) {
									t.fail('(MAIN) MongoDB drop database: ' + err.message);
									process.exit(1);
								}
								
								// (test_drop_pass) Dropped database
								t.pass('(MAIN) MongoDB drop database');
								process.exit(0);
							});
						});
					});
			});
			
			// (test_stream_fail) Fail if error
			stream.on('error', error => {
				t.fail('(B) STREAM POST statuses/filter to insertOne: ' + error.message);
				stream.destroy();
				
				// (test_drop) Drop database
				Client.connect(process.env.MONGODB_CONNECTION, function(err, client) {
					
					// (test_drop_fail) Unable to drop database due to connection
					if (err) {
						t.fail('(MAIN) MongoDB drop database: ' + err.message);
						process.exit(1);
					}
					
					// (test_drop_client) Drop database with client
					var db = client.db(process.env.MONGODB_DATABASE);
					db.dropDatabase((err, res) => {
						
						// (test_drop_fail2) Unable to drop database
						if (err) {
							t.fail('(MAIN) MongoDB drop database: ' + err.message);
							process.exit(1);
						}
						
						// (test_drop_pass) Dropped database
						t.pass('(MAIN) MongoDB drop database');
						process.exit(0);
					});
				});
			});
		})
		.catch(err => {
			
			// (test_connect_fail) Unable to connect
			t.fail('(MAIN) MongoDB connect: ' + err.message);
		});
	t.end();
});
