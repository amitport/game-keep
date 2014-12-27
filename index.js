'use strict';

var config = require('config');

// Connect to database
require('mongoose').connect(config.get('mongo.uri'));

module.exports = {
	gameSession: require('./lib/models/GameSession')
};
