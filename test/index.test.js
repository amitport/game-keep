'use strict';

var assert = require('assert');

var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
mockgoose(mongoose);

describe('game sessions API', function() {
	var GameSession;
	var gameSession;
	var gameSessionTypeId;
	var gameSessionId;

	before(function() {
		GameSession = require('../lib/models/GameSession');
		gameSessionTypeId = mongoose.Types.ObjectId();
	});

	it('should store game sessions', function(done) {
		GameSession.create({
			game: {type: gameSessionTypeId}
		}, function(err, _gameSession) {
			assert.ifError(err);
			assert(_gameSession);

			gameSessionId = _gameSession._id;
			gameSession = _gameSession;
			done();
		});
	});

	it('should retrieve game sessions', function(done) {
		GameSession.findById(gameSessionId, function(err, _gameSession) {
			assert.ifError(err);
			assert(_gameSession);
			assert(gameSession.equals(_gameSession));
			done();
		});
	});

	it('should set a default status', function() {
		assert(gameSession.status);
		assert.equal(gameSession.status, 'NOT_STARTED');
	});
});

//TODO game type tests
require('../lib/gameType');
