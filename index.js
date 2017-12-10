// Richard Wen
// rrwen.dev@gmail.com

var jsonata = require("jsonata");
var MongoClient = require('mongodb').MongoClient;
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
 * @param {Object} [options.mongodb={}] contains options for queries in {@link https://www.npmjs.com/package/mongodb mongodb}.
 * @param {string} [options.mongodb.connection=process.env.MONGODB_CONNECTION || 'mongodb://localhost:27017'] MongoDB {@link https://docs.mongodb.com/manual/reference/connection-string/ connection string}.
 * @param {string} [options.mongodb.collection=process.env.MONGODB_COLLECTION || 'twitter_data'] Mongodb {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection} name.
 * @param {string} [options.jsonata=process.env.JSONATA] {@link https://www.npmjs.com/package/jsonata jsonata} query for the received tweet object in JSON format before inserting into the MongoDB collection (`options.mongodb.collection`).
 * @param {Object} [options.stream={}] options for the returned {@link  https://www.npmjs.com/package/twitter#streaming-api Twitter stream}.
 * @param {function} [options.stream.callback=function(err, data){}] callback function on a stream 'data' event.
 *
 * * `err` is the {@link Error} object
 * * `data` is in the form of `{twitter: {stream: stream, tweets: Object}, mongodb: {client: Object, results: Object}}`
 * * `data.twitter.stream` is the {@link https://www.npmjs.com/package/twitter#streaming-api twitter stream}
 * * `data.twitter.tweets` are  the {@link https://www.npmjs.com/package/twitter tweets} in JSON format
 * * `data.mongodb.client` is the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/MongoClient client} from `options.mongodb.connection`
 * * `data.mongodb.results` is the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#~insertWriteOpResult query results} of `options.mongodb.query`
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
 * * `data.twitter.client`: contains a {@link https://www.npmjs.com/package/twitter Twitter client} object created from `options.twitter.connection`  
 * * `data.twitter.tweets`: contains the {@link https://www.npmjs.com/package/twitter tweets} in JSON format  
 * * `data.mongodb.client`: contains the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/MongoClient client} from `options.mongodb.connection`  
 * * `data.mongodb.results`: contains the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#~insertWriteOpResult query results} of `options.mongodb.query`  
 *
 *
 * @example
 * var twitter2mongodb = require('../index.js');
 */
module.exports = options => {
	options = options || {};
};
