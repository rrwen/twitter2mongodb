// Richard Wen
// rrwen.dev@gmail.com

require('dotenv').config();

// (packages) Package dependencies
var fs = require('fs');
var moment = require('moment');
var MongoClient = require('mongodb').MongoClient;
var twitter2mongodb = require('../index.js');
var test = require('tape');

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
var optionalPackages = [];
for (var k in json.optionalDependencies) {
	optionalPackages.push(k + ' (' + json.optionalDependencies[k] + ')');
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
	t.comment('Optional:' + optionalPackages.join(','));
	
	// (test_connect) Connect to database
	MongoClient.connect(process.env.MONGODB_CONNECTION)
	
	// (test_create) Create test database
	t.end();
});
