## Test Environment

The test environment creates an isolated MongoDB database named `twitter2mongodb_database` to run tests on.

To connect to Twiter and MongoDB, a `.env` file is required:

1. Create a `.env` file in the root directory
2. Use the template below to provide Twitter credentials and MongoDB connection details inside the `.env` file
3. Ensure that `twitter2mongodb_database` does not exist (otherwise it will be dropped after tests)

```
TWITTER_CONSUMER_KEY=***
TWITTER_CONSUMER_SECRET=***
TWITTER_ACCESS_TOKEN_KEY=***
TWITTER_ACCESS_TOKEN_SECRET=***
MONGODB_CONNECTION=mongodb://localhost:27017
MONGODB_TESTDATABASE=twitter2mongodb_database
MONGODB_COLLECTION=twitter_data
```

The [Tests](../README.md#tests) can then be run with the following command:

```
npm test
```
