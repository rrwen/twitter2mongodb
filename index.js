// Richard Wen
// rrwen.dev@gmail.com

var twitter2return = require('twitter2return');

const Client = require('mongodb').MongoClient;

/**
 * Extract data from the Twitter Application Programming Interface (API) to a MongoDB collection.
 *
 * * {@link https://docs.mongodb.com/ MongoDB Database Documentation}
 * * {@link https://developer.twitter.com/en/docs Twitter Developer Documentation}
 *
 * @module twitter2mongodb
 *
 * @param {Object} [options={}] options for this function.
 * @param {Object} [options.twitter={}] options for {@link https://www.npmjs.com/package/twitter twitter} (see {@link https://rrwen.github.io/twitter2return/ twitter2return}).
 *
 * @param {function} [options.twitter.stream=function(err, data){}] callback function on a stream 'data' event  for the returned {@link  https://www.npmjs.com/package/twitter#streaming-api Twitter stream}.
 *
 * * `err` is the {@link Error} object
 * * `data` is in the form of `{twitter: {stream: stream, tweets: Object}, mongodb: {client: Object, results: Object}}`
 * * `data.twitter.stream` is the {@link https://www.npmjs.com/package/twitter#streaming-api twitter stream}
 * * `data.twitter.tweets` are  the {@link https://www.npmjs.com/package/twitter tweets} in JSON format
 * * `data.mongodb.client`: contains the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/MongoClient client}  
 * * `data.mongodb.collection`: contains the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection} object from `options.mongodb.collection`  
 * * `data.mongodb.db`: contains the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Db db instance} from `options.mongodb.connection`  
 * * `data.mongodb.results`: contains the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#~insertWriteOpResult method results} of `options.mongodb.method`  
 *
 * @param {Object} [options.mongodb={}] contains options for methods in {@link https://www.npmjs.com/package/mongodb mongodb}.
 * @param {string} [options.mongodb.connection=process.env.MONGODB_CONNECTION || 'mongodb://localhost:27017'] MongoDB {@link https://docs.mongodb.com/manual/reference/connection-string/ connection string}.
 * @param {string} [options.mongodb.database=process.env.MONGODB_DATABASE || 'test'] MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Db database name}.
 * @param {string} [options.mongodb.collection=process.env.MONGODB_COLLECTION || 'twitter_data'] Mongodb {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection} name.
 * @param {string|Object} [options.mongodb.options=process.env.MONGODB_OPTIONS] Mongodb client {@link https://mongodb.github.io/node-mongodb-native/3.0/api/MongoClient.html#.connect connect options}.
 * @param {string} [options.mongodb.method=process.env.MONGODB_METHOD||'insertOne'] Mongodb {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection} method.
 * @param {string|Object} [options.mongodb.method_options=process.env.MONGODB_METHOD_OPTIONS] Mongodb {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection} method options relative to `options.mongodb.method`.
 * @param {function} [options.mongodb.check=function(tweets){return(true)};] a function that performs a true or false test to determine whether to insert the tweet or not
 *
 * * `options.mongodb.check` is in the form of `function(tweets) {return (true || false)};`
 * * `tweets` is a {@link https://www.npmjs.com/package/twitter tweets} object for checking
 * * Return `true` to insert the data into MongoDB or `false` to skip insertion
 *
 * @param {string} [options.jsonata=process.env.JSONATA] {@link https://www.npmjs.com/package/jsonata jsonata} query for the received tweet object in JSON format before inserting into the MongoDB collection (`options.mongodb.collection`).
 *
 * @returns {(Promise|stream)} Returns a stream if `options.twitter.method` is 'stream', otherwise returns a Promise:
 *
 * **If `options.twitter.method` == `'stream'`** 
 *
 * * Return a {@link https://www.npmjs.com/package/twitter#streaming-api Twitter stream}  
 * * `stream.on('data', function)`: calls `function` when a tweet is available  
 * * `stream.on('error', function)`: calls `function` when there is an error  
 *
 * **Else** 
 * 
 * * Return a {@link Promise} object that resolves a `data` object in the form `{twitter: {client: ..., tweets: ...}, mongodb: {client: ..., results: ...}}`  
 *
 * * `data.twitter.client`: contains a {@link https://www.npmjs.com/package/twitter Twitter client} object created from `options.twitter.connection`  
 * * `data.twitter.tweets`: contains the {@link https://www.npmjs.com/package/twitter tweets} in JSON format  
 * * `data.mongodb.client`: contains the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/MongoClient client}  
 * * `data.mongodb.collection`: contains the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection} object from `options.mongodb.collection`   
 * * `data.mongodb.db`: contains the MongoDB (@link https://mongodb.github.io/node-mongodb-native/3.0/api/Db db instance} from `options.mongodb.connection`  
 * * `data.mongodb.results`: contains the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#~insertWriteOpResult method results} of `options.mongodb.method`  
 *
 * @example
 * var twitter2mongodb = require('twitter2mongodb');
 *
 * // (options) Initialize options object
 * var options = {
 * 	twitter: {},
 * 	mongodb: {}
 * };
 *
 * // *** CONNECTION SETUP ***
 * 
 * // (options_twitter_connection) Twitter API connection keys
 * options.twitter.connection =  {
 * 	consumer_key: '***', // process.env.TWITTER_CONSUMER_KEY
 * 	consumer_secret: '***', // process.env.TWITTER_CONSUMER_SECRET
 * 	access_token_key: '***', // process.env.TWITTER_ACCESS_TOKEN_KEY
 * 	access_token_secret: '***' // process.env.TWITTER_ACCESS_TOKEN_SECRET
 * };
 *
 * // (options_mongodb_connection) MongoDB connection details
 * // Format: 'mongodb://<user>:<password>@<host>:<port>/<database>'
 * options.mongodb.connection = 'mongodb://localhost:27017/test';
 *
 * // *** SEARCH TWEETS ***
 *
 * // (options_twitter_rest) Search for keyword 'twitter' in path 'GET search/tweets'
 * options.twitter.method = 'get'; // get, post, or stream
 * options.twitter.path = 'search/tweets'; // api path
 * options.twitter.params = {q: 'twitter'}; // query tweets
 *
 * // (options_jsonata) Filter for statuses array using jsonata
 * options.jsonata = 'statuses';
 * 
 * // (options_mongodb) MongoDB options
 * options.mongodb.method = 'insertMany'; // insert many objects due to array
 * 
 * // (twitter2mongodb_rest) Query tweets using REST API into MongoDB collection
 * twitter2mongodb(options)
 * 	.then(data => {
 * 		console.log(data);
 * 	}).catch(err => {
 * 		console.error(err.message);
 * 	});
 *
 * // *** STREAM TWEETS ***
 *
 * // (options_twitter_connection) Track keyword 'twitter' in path 'POST statuses/filter'
 * options.twitter.method = 'stream'; // get, post, or stream
 * options.twitter.path = 'statuses/filter'; // api path
 * options.twitter.params = {track: 'twitter'}; // query tweets
 *
 * // (options_mongodb) MongoDB options
 * options.mongodb.method = 'insertOne';
 *
 * // (options_jsonata) Remove jsonata filter
 * delete options.jsonata;
 * 
 * // (twitter2mongodb_stream) Stream tweets into MongoDB collection
 * var stream = twitter2mongodb(options);
 * stream.on('error', function(error) {
 * 	console.error(error.message);
 * });
 * 
 */
module.exports = options => {
	options = options || {};
	
	// (mongodb_defaults) Default options for mongodb
	options.mongodb = options.mongodb || {};
	options.mongodb.connection = options.mongodb.connection || process.env.MONGODB_CONNECTION || 'mongodb://localhost:27017/test';
	options.mongodb.database = options.mongodb.database || process.env.MONGODB_DATABASE || 'test';
	options.mongodb.collection = options.mongodb.collection || process.env.MONGODB_COLLECTION || 'twitter_data';
	options.mongodb.options = options.mongodb.options || process.env.MONGODB_OPTIONS;
	options.mongodb.method = options.mongodb.method || process.env.MONGODB_METHOD || 'insertOne';
	options.mongodb.method_options = options.mongodb.method_options || process.env.MONGODB_METHOD_OPTIONS;
	options.mongodb.check = options.mongodb.check || function(tweets) {return(true);};
	if (typeof options.mongodb.options == 'string') {
		options.mongodb.options = JSON.parse(options.mongodb.options);
	}
	if (typeof options.mongodb.method_options == 'string') {
		options.mongodb.method_options = JSON.parse(options.mongodb.method_options);
	}
	
	// (twitter_defaults) Default options for twitter
	options.twitter = options.twitter || {};
	options.twitter.method = options.twitter.method || 'get';
	
	// (twitter_stream) Streaming API
	if (options.twitter.method == 'stream') {
		
		// (mongodb_connect) Connect to mongodb
		var mongoClient, mongoDB, mongoCollection;
		Client.connect(options.mongodb.connection, function(err, client) {
			if (err) throw err;
			
			// (mongodb_connect_pool) Create mongodb client pool
			mongoClient = client;
			
			// (mongodb_connect_database) Create mongodb database
			mongoDB = mongoClient.db(options.mongodb.database);
			
			// (mongodb_connect_collection) Create mongodb collection
			mongoCollection = mongoDB.collection(options.mongodb.collection);
		});
		
		// (twitter_stream_mongodb) Insert tweets into collection as docs
		var streamCallback = options.twitter.stream || function(err, data) {};
		options.twitter.stream = function(err, data) {
			if (mongoCollection && options.mongodb.check(data.twitter.tweets)) {
				mongoCollection[options.mongodb.method](data.twitter.tweets, options.mongodb.method_options, function(err, res) {
					data.mongodb = {client: mongoClient, collection: mongoCollection, db: mongoDB, results: res};
					streamCallback(err, data);
				});
			}
		};
		
		// (twitter_stream_return) Return twitter stream
		var stream = twitter2return(options);
		return stream;
	} else {
		
		// (twitter_rest) REST API
		return Client.connect(options.mongodb.connection)
			.then(client => {
				
				// (mongodb_connect_database) Create mongodb database
				var db = client.db(options.mongodb.database);
				
				// (mongodb_connect_collection) Create mongodb collection
				var collection = db.collection(options.mongodb.collection);
				return {client: client, db: db, collection: collection};
			})
			.then(mongo => {
				return twitter2return(options)
					.then(data => {
						
						// (twitter_promise_true) Return mongodb promise
						if (options.mongodb.check(data.twitter.tweets)) {
							return mongo.collection[options.mongodb.method](data.twitter.tweets, options.mongodb.method_options)
								.then(res => {
									data.mongodb = {client: mongo.client, collection: mongo.collection, db: mongo.db, results: res};
									return data;
								});
						} else {
							
							// (twitter_promise_false) Fail check return data but do not insert
							data.mongodb = {client: mongo.client, collection: mongo.collection, db: mongo.db};
							return data;
						}
					});
			})
			.catch(err => {
				
				// (mongodb_connect_error) Unable to connect
				throw err;
			});
	}
};
