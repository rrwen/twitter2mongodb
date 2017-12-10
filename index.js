// Richard Wen
// rrwen.dev@gmail.com

var jsonata = require("jsonata");
var mongoClient = require('mongodb').MongoClient;
var Twitter = require('twitter');

/**
 * Extract data from the Twitter Application Programming Interface (API) to a MongoDB collection.
 *
 * * {@link https://docs.mongodb.com/ MongoDB Database Documentation}
 * * {@link https://developer.twitter.com/en/docs Twitter Developer Documentation}
 *
 * @module twitter2mongodb
 *
 * @param {Object} [options={}] options for this function.
 * @param {Object} [options.twitter={}] options for {@link https://www.npmjs.com/package/twitter twitter}.
 * @param {Object} [options.twitter.method=process.env.TWITTER_METHOD || 'get'] Twitter API request method in lowercase letters ('get', 'post', 'delete', or 'stream').
 * @param {Object} [options.twitter.path=process.env.TWITTER_PATH || 'search/tweets'] Twitter API endpoint path (such as 'search/tweets' for 'get' or 'statuses/filter' for 'stream').
 *
 * * For REST API endpoints, see {@link https://developer.twitter.com/en/docs/api-reference-index Twitter API Reference Index}
 * * For Streaming endpoints, see {@link https://developer.twitter.com/en/docs/tweets/filter-realtime/overview Filter Realtime Tweets}
 *
 * @param {Object} [options.twitter.params=process.env.TWITTER_PARAMS || {q:'twitter'}] Twitter API parameters for the `options.twitter.method` and `options.twitter.path`.
 *
 * * For REST API endpoints, see {@link https://developer.twitter.com/en/docs/api-reference-index Twitter API Reference Index}
 * * For Streaming endpoints, see {@link https://developer.twitter.com/en/docs/tweets/filter-realtime/overview Filter Realtime Tweets}
 *
 * @param {Object} [options.twitter.connection={}] Twitter API connection credentials:  
 *
 * 1. Login at {@link https://apps.twitter.com/}
 * 2. Create a {@link https://apps.twitter.com/app/new new application}
 * 3. Go to your {@link https://apps.twitter.com/ applications}
 * 4. Click on your created application
 * 5. Click on **Keys and Access Tokens**
 * 6. Keep note of the following:
 *
 * * **Consumer Key (API Key)**
 * * **Consumer Secret (API Secret)**
 * * **Access Token**
 * * **Access Token Secret**
 *
 * @param {string} [options.twitter.connection.consumer_key=process.env.TWITTER_CONSUMER_KEY] Twitter API **Consumer Key (API Key)**.
 * @param {string} [options.twitter.connection.consumer_secret=process.env.TWITTER_CONSUMER_SECRET] Twitter API **Consumer Secret (API Secret)**.
 * @param {string} [options.twitter.connection.access_token_key=process.env.TWITTER_ACCESS_TOKEN_KEY] Twitter API **Access Token Key**.
 * @param {string} [options.twitter.connection.access_token_secret=process.env.TWITTER_ACCESS_TOKEN_SECRET] Twitter API **Access Token Secret**.
 * @param {string} [options.twitter.connection.bearer_token=process.env.TWITTER_BEARER_TOKEN] Twitter API **Bearer Token**.
 * @param {Object} [options.mongodb={}] contains options for methods in {@link https://www.npmjs.com/package/mongodb mongodb}.
 * @param {string} [options.mongodb.connection=process.env.MONGODB_CONNECTION || 'mongodb://localhost:27017/test'] MongoDB {@link https://docs.mongodb.com/manual/reference/connection-string/ connection string}.
 * @param {string} [options.mongodb.collection=process.env.MONGODB_COLLECTION || 'twitter_data'] Mongodb {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection} name.
 * @param {string|Object} [options.mongodb.options=process.env.MONGODB_OPTIONS] Mongodb client {@link https://mongodb.github.io/node-mongodb-native/3.0/api/MongoClient.html#.connect connect options}.
  * @param {string} [options.mongodb.method=process.env.MONGODB_METHOD||'insertOne'] Mongodb {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection} method.
  * @param {string|Object} [options.mongodb.method_options=process.env.MONGODB_METHOD_OPTIONS] Mongodb {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection} method options relative to `options.mongodb.method`.
 * @param {string} [options.jsonata=process.env.JSONATA] {@link https://www.npmjs.com/package/jsonata jsonata} query for the received tweet object in JSON format before inserting into the MongoDB collection (`options.mongodb.collection`).
 * @param {Object} [options.stream={}] options for the returned {@link  https://www.npmjs.com/package/twitter#streaming-api Twitter stream}.
 * @param {function} [options.stream.callback=function(err, data){}] callback function on a stream 'data' event.
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
 * 	pg: {}
 * };
 *
 * // *** CONNECTION SETUP ***
 * 
 * // (options_twitter_connection) Twitter API connection keys
 * options.twitter.connection =  {
 * 	consumer_key: '***',
 * 	consumer_secret: '***',
 * 	access_token_key: '***',
 * 	access_token_secret: '***'
 * };
 *
 * // (options_mongodb_connection) MongoDB connection details
 * // Format: 'mongodb://<user>:<password>@<host>:<port>/<database>'
 * options.mongodb.connection = 'mongodb://localhost:27017/test';
 *
 * // *** SEARCH TWEETS ***
 *
 * // (options_twitter_rest) Search for keyword 'twitter' in path 'GET search/tweets'
 * options.twitter = {
 * 	method: 'get', // get, post, or stream
 * 	path: 'search/tweets', // api path
 * 	params: {q: 'twitter'} // query tweets
 * };
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
 * options.twitter = {
 * 	method: 'stream',
 * 	path: 'statuses/filter',
 * 	params: {track: 'twitter'}
 * };
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
	options.jsonata = options.jsonata || process.env.JSONATA;
	
	// (stream_defaults) Default options for streams
	options.stream = options.stream || {};
	options.stream.callback = options.stream.callback || function(err, data){};
	
	// (twitter_defaults) Default options for twitter
	options.twitter = options.twitter || {};
	options.twitter.method = options.twitter.method || process.env.TWITTER_METHOD || 'get';
	options.twitter.path = options.twitter.path || process.env.TWITTER_PATH || 'search/tweets';
	options.twitter.params = options.twitter.params || process.env.TWITTER_PARAMS || {q:'twitter'};
	if (typeof options.twitter.params == 'string') {
		options.twitter.params = JSON.parse(options.twitter.params);
	}
	
	// (twitter_connect) Connection options for twitter
	options.twitter.connection = options.twitter.connection || {};
	options.twitter.connection.consumer_key = options.twitter.connection.consumer_key || process.env.TWITTER_CONSUMER_KEY;
	options.twitter.connection.consumer_secret = options.twitter.connection.consumer_secret || process.env.TWITTER_CONSUMER_SECRET;
	options.twitter.connection.access_token_key = options.twitter.connection.access_token_key || process.env.TWITTER_ACCESS_TOKEN_KEY;
	options.twitter.connection.access_token_secret = options.twitter.connection.access_token_secret || process.env.TWITTER_ACCESS_TOKEN_SECRET;
	options.twitter.connection.bearer_token = options.twitter.connection.bearer_token || process.env.TWITTER_BEARER_TOKEN;
	var client = new Twitter(options.twitter.connection);
	
	// (mongodb_defaults) Default options for mongodb
	options.mongodb = options.mongodb || {};
	options.mongodb.connection = options.mongodb.connection || process.env.MONGODB_CONNECTION || 'mongodb://localhost:27017/test';
	options.mongodb.collection = options.mongodb.collection || process.env.MONGODB_COLLECTION || 'twitter_data';
	options.mongodb.options = options.mongodb.options || process.env.MONGODB_OPTIONS;
	options.mongodb.method = options.mongodb.method || process.env.MONGODB_METHOD || 'insertOne';
	options.mongodb.method_options = options.mongodb.method_options || process.env.MONGODB_METHOD_OPTIONS;
	if (typeof options.mongodb.options == 'string') {
		options.mongodb.options = JSON.parse(options.mongodb.options);
	}
	if (typeof options.mongodb.method_options == 'string') {
		options.mongodb.method_options = JSON.parse(options.mongodb.method_options);
	}
	
	// (mongodb_connect) Connection options for mongodb
	var mongoDB, mongoCollection;
	if (typeof options.mongodb.connection == 'string') {
		mongoClient.connect(function(err, db) {
			
			// (mongodb_connect_error) Unable to connect
			if (err) {
				throw err;
			}
			
			// (mongodb_connect_pool) Create mongodb client pool
			mongoDB = db;
			if (options.mongodb.collection instanceof db.collection) {
				mongoCollection = options.mongodb.collection;
			} else {
				mongoCollection = db.collection(options.mongodb.collection);
			}
		});
	}
	
	// (twitter_stream) Streaming API
	if (options.twitter.method == 'stream') {
		var stream = client[options.twitter.method](options.twitter.path, options.twitter.params);
		stream.on('data', function(tweets) {
			
			// (twitter_stream_jsonata) Filter tweets using jsonata syntax
			if (options.jsonata) {
				tweets = jsonata(options.jsonata).evaluate(tweets);
			}
			
			// (twitter_stream_mongodb) Insert tweets into collection as docs
			mongoCollection[options.mongodb.method](tweets, options.mongodb.method_options, function(err, res) {
				var data = {twitter: {stream: stream, tweets: tweets}, mongodb: {client: mongoClient, collection: mongoCollection, db: mongoDB, results: res}};
				options.stream.callback(err, data);
			});
		});
		return stream;
	} else {
		
		// (twitter_rest) REST API
		return client[options.twitter.method](options.twitter.path, options.twitter.params)
			.then(tweets => {
				
				// (twitter_rest_jsonata) Filter tweets using jsonata syntax
				if (options.jsonata) {
					tweets = jsonata(options.jsonata).evaluate(tweets);
				}
				
				// (twitter_rest_mongodb) Insert tweets into mongodb
				return mongoCollection[options.mongodb.method](tweets, options.mongodb.method_options)
					.then(res => {
						return {twitter: {stream: stream, tweets: tweets}, mongodb: {client: mongoClient, collection: mongoCollection, db: mongoDB, results: res}};
					});
			});
	}
};
