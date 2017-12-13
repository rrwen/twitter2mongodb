# twitter2mongodb

Richard Wen  
rrwen.dev@gmail.com  

* [Documentation](https://rrwen.github.io/twitter2mongodb)

Module for extracting Twitter data to MongoDB databases

[![npm version](https://badge.fury.io/js/twitter2mongodb.svg)](https://badge.fury.io/js/twitter2mongodb)
[![Build Status](https://travis-ci.org/rrwen/twitter2mongodb.svg?branch=master)](https://travis-ci.org/rrwen/twitter2mongodb)
[![Coverage Status](https://coveralls.io/repos/github/rrwen/twitter2mongodb/badge.svg?branch=master)](https://coveralls.io/github/rrwen/twitter2mongodb?branch=master)
[![npm](https://img.shields.io/npm/dt/twitter2mongodb.svg)](https://www.npmjs.com/package/twitter2mongodb)
[![GitHub license](https://img.shields.io/github/license/rrwen/twitter2mongodb.svg)](https://github.com/rrwen/twitter2mongodb/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/url/https/github.com/rrwen/twitter2mongodb.svg?style=social)](https://twitter.com/intent/tweet?text=Module%20for%20extracting%20Twitter%20data%20to%20MongoDB%20databases:%20https%3A%2F%2Fgithub.com%2Frrwen%2Ftwitter2mongodb%20%23nodejs%20%23npm)

## Install

1. Install [Node.js](https://nodejs.org/en/)
2. Install [twitter2mongodb](https://www.npmjs.com/package/twitter2mongodb) via `npm`

```
npm install --save twitter2mongodb
```

For the latest developer version, see [Developer Install](#developer-install).

## Usage

It is recommended to use a `.env` file at the root of your project directory with the following contents:

* Obtain the keys below from https://apps.twitter.com/
* `TWITTER_CONSUMER_KEY`: Consumer key (API Key)
* `TWITTER_CONSUMER_SECRET`: Consumer secret (API secret)
* ` TWITTER_ACCESS_TOKEN_KEY`: Access token
* `TWITTER_ACCESS_TOKEN_SECRET`: Access token secret
* `MONGODB_CONNECTION`: MongoDB [connection string](https://docs.mongodb.com/manual/reference/connection-string/)
*` MONGODB_DATABASE`: MongoDB database name
* `MONGODB_COLLECTION`: MongoDB collection name

```
TWITTER_CONSUMER_KEY=***
TWITTER_CONSUMER_SECRET=***
TWITTER_ACCESS_TOKEN_KEY=***
TWITTER_ACCESS_TOKEN_SECRET=***
MONGODB_CONNECTION=mongodb://localhost:27017
MONGODB_DATABASE=test
MONGODB_COLLECTION=twitter_data
```

The `.env` file above can be loaded using [dotenv](https://www.npmjs.com/package/dotenv) (`npm install --save dotenv`):

```javascript
require('dotenv').config();
```

See [Documentation](https://rrwen.github.io/twitter2mongodb) for more details.

### REST API

1. Load `.env` file variables
2. Load `twitter2mongodb`
3. Create `options` object
4. Optionally define Twitter API keys and MongoDB connection
5. Search keyword `twitter` from `GET search/tweets`
6. Apply a `jsonata` filter for statuses key only
7. Execute `twitter2mongodb` with the REST API options

```javascript
var twitter2mongodb = require('twitter2mongodb');

// (options) Initialize options object
var options = {
	twitter: {},
	mongodb: {}
};

// (options_twitter_connection) Twitter API connection keys
options.twitter.connection =  {
	consumer_key: '***', // process.env.TWITTER_CONSUMER_KEY
	consumer_secret: '***', // process.env.TWITTER_CONSUMER_SECRET
	access_token_key: '***', // process.env.TWITTER_ACCESS_TOKEN_SECRET
	access_token_secret: '***' // process.env.TWITTER_ACCESS_TOKEN_SECRET
};

// (options_mongodb_connection) MongoDB connection details
// Format: 'mongodb://<user>:<password>@<host>:<port>/<database>'
options.mongodb.connection = 'mongodb://localhost:27017'; // process.env.MONGODB_CONNECTION
options.mongodb.database = 'test'; // process.env.MONGODB_DATABASE
options.mongodb.collection = 'twitter_data'; // process.env.MONGODB_COLLECTION

// (options_twitter_rest) Search for keyword 'twitter' in path 'GET search/tweets'
options.twitter.method = 'get'; // get, post, or stream
options.twitter.path = 'search/tweets'; // api path
options.twitter.params = {q: 'twitter'}; // query tweets

// (options_jsonata) Filter for statuses array using jsonata
options.jsonata = 'statuses';

// (options_mongodb) MongoDB options
options.mongodb.method = 'insertMany'; // insert many objects due to array

// (twitter2mongodb_rest) Query tweets using REST API into MongoDB collection
twitter2mongodb(options)
	.then(data => {
		console.log(data);
	}).catch(err => {
		console.error(err.message);
	});
```

### Stream API

1. Load `.env` file variables
2. Load `twitter2mongodb`
3. Create `options` object
4. Optionally define Twitter API keys and MongoDB connection
5. Track keyword `twitter` from `POST statuses/filter`
6. Log the `tweets` when they are received
7. Execute `twitter2return` with the Stream API options

```
var twitter2mongodb = require('twitter2mongodb');

// (options) Initialize options object
var options = {
	twitter: {},
	mongodb: {}
};

// (options_twitter_connection) Twitter API connection keys
options.twitter.connection =  {
	consumer_key: '***', // process.env.TWITTER_CONSUMER_KEY
	consumer_secret: '***', // process.env.TWITTER_CONSUMER_SECRET
	access_token_key: '***', // process.env.TWITTER_ACCESS_TOKEN_SECRET
	access_token_secret: '***' // process.env.TWITTER_ACCESS_TOKEN_SECRET
};

// (options_mongodb_connection) MongoDB connection details
// Format: 'mongodb://<user>:<password>@<host>:<port>/<database>'
options.mongodb.connection = 'mongodb://localhost:27017'; // process.env.MONGODB_CONNECTION
options.mongodb.database = 'test'; // process.env.MONGODB_DATABASE
options.mongodb.collection = 'twitter_data'; // process.env.MONGODB_COLLECTION

// (options_twitter_connection) Track keyword 'twitter' in path 'POST statuses/filter'
options.twitter.method = 'stream'; // get, post, or stream
options.twitter.path = 'statuses/filter'; // api path
options.twitter.params = {track: 'twitter'}; // query tweets

// (options_mongodb) MongoDB options
options.mongodb.method = 'insertOne';

// (options_jsonata) Remove jsonata filter
delete options.jsonata;

// (twitter2mongodb_stream) Stream tweets into MongoDB collection
var stream = twitter2mongodb(options);
stream.on('error', function(error) {
	console.error(error.message);
});
```

## Contributions

### Report Contributions

Reports for issues and suggestions can be made using the [issue submission](https://github.com/rrwen/twitter2mongodb/issues) interface.

When possible, ensure that your submission is:

* **Descriptive**: has informative title, explanations, and screenshots
* **Specific**: has details of environment (such as operating system and hardware) and software used
* **Reproducible**: has steps, code, and examples to reproduce the issue

### Code Contributions

Code contributions are submitted via [pull requests](https://help.github.com/articles/about-pull-requests/):

1. Ensure that you pass the [Tests](#tests)
2. Create a new [pull request](https://github.com/rrwen/twitter2mongodb/pulls)
3. Provide an explanation of the changes

A template of the code contribution explanation is provided below:

```
## Purpose

The purpose can mention goals that include fixes to bugs, addition of features, and other improvements, etc.

## Description

The description is a short summary of the changes made such as improved speeds or features, and implementation details.

## Changes

The changes are a list of general edits made to the files and their respective components.
* `file_path1`:
    * `function_module_etc`: changed loop to map
    * `function_module_etc`: changed variable value
* `file_path2`:
    * `function_module_etc`: changed loop to map
    * `function_module_etc`: changed variable value

## Notes

The notes provide any additional text that do not fit into the above sections.
```

For more information, see [Developer Install](#developer-install) and [Implementation](#implementation).

## Developer Notes

### Developer Install

Install the latest developer version with `npm` from github:

```
npm install git+https://github.com/rrwen/twitter2mongodb
```
  
Install from `git` cloned source:

1. Ensure [git](https://git-scm.com/) is installed
2. Clone into current path
3. Install via `npm`

```
git clone https://github.com/rrwen/twitter2mongodb
cd twitter2mongodb
npm install
```

### Tests

1. Clone into current path `git clone https://github.com/rrwen/twitter2mongodb`
2. Enter into folder `cd twitter2mongodb`
3. Ensure [devDependencies](https://docs.npmjs.com/files/package.json#devdependencies) are installed and available
4. Run tests with a `.env` file (see [tests/README.md](tests/README.md))
5. Results are saved to [tests/log](tests/log) with each file corresponding to a version tested

```
npm install
npm test
```

### Documentation

Use [documentationjs](https://www.npmjs.com/package/documentation) to generate html documentation in the `docs` folder:

```
npm run docs
```

See [JSDoc style](http://usejsdoc.org/) for formatting syntax.

### Upload to Github

1. Ensure [git](https://git-scm.com/) is installed
2. Inside the `twitter2mongodb` folder, add all files and commit changes
3. Push to github

```
git add .
git commit -a -m "Generic update"
git push
```

### Upload to npm

1. Update the version in `package.json`
2. Run tests and check for OK status (see [tests/README.md](tests/README.md))
3. Generate documentation
4. Login to npm
5. Publish to npm

```
npm test
npm run docs
npm login
npm publish
```

### Implementation

The module [twitter2mongodb](https://www.npmjs.com/package/twitter2mongodb) uses the following [npm](https://www.npmjs.com/) packages for its implementation:

npm | Purpose
--- | ---
[twitter2return](https://www.npmjs.com/package/twitter2return) | Connections to the Twitter API REST and Streaming Application Programming Interfaces (APIs) using [twitter](https://www.npmjs.com/package/twitter), and Filters with [jsonata](https://www.npmjs.com/package/jsonata) before inserting into MongoDB
[mongodb](https://www.npmjs.com/package/mongodb) | Insert Twitter data to MongoDB collections

```
twitter2return   <-- Extract Twitter data from API and Filter JSON data
      |
   mongodb       <-- Insert filtered Twitter data into MongoDB collection
```
