'use strict';

var GameType = require('./models/GameType');
var GameSession = require('./models/GameSession');

function getGameTypeIdFromName(gameTypeName, cb) {
	GameType.findOne({name: gameTypeName.toLowerCase()}, '_id', {lean: true},
		function(err, gameType) {
			if (err) {
				cb(err);
			} else if (!gameType) {
				cb('gameTypeName: \'' + gameTypeName + '\' not found');
			} else {
				cb(null, gameType._id);
			}
		}
	);
}

module.exports = {
	getGameTypes: function(cb) {
		GameType.find({}, null, {lean: true}, cb);
	},
	getGameTypeFromName: function(gameTypeName, cb) {
		GameType.findOne({name: gameTypeName.toLowerCase()}, null, {lean: true}, cb);
	},
	createGameSession: function(gameTypeId, userId, cb) {
		GameSession.create(
			{
				game: {type: gameTypeId},
				participants: [{user: userId}]
			},
			function(err, newGameSession) {
				if (err) {
					cb(err);
				} else {
					cb(null, newGameSession._id);
				}
		});
	},
	createGameSessionOld: function(gameTypeName, cb) {
		getGameTypeIdFromName(gameTypeName, function(err, gameTypeId) {
			if (err) {
				cb(err);
			} else {
				GameSession.create({game: {type: gameTypeId}}, function(err, newGameSession) {
					if (err) {
						cb(err);
					} else {
						cb(null, newGameSession._id);
					}
				});
			}
		});
	},
	startGameSession: function(gameSessionId, cb) {
		var where = {_id: gameSessionId, status: 'NOT_STARTED'};
		// get and verify the game session
		GameSession.findOne(where, '-_id game.type participants.length')
		.populate({path: 'game.type', select: '-_id name minNumberOfParticipants'})
		.exec(function(err, gameSession) {
			if (err) {
				cb(err);
			} else if (!gameSession ||
			           !gameSession.participants ||
			           gameSession.participants.length < gameSession.game.type.minNumberOfParticipants) {
				cb('(initial verification) game session either (1) does not exist, (2) already started, or ' +
				   '(3) has not reached the minimum number of participants');
			} else {
				// start the game session
				var update = {
					status: 'IN_PROGRESS',
					'game.state': gameSession.game.type.rules.createGameState()
				};

				// ensure that the number of participant remain above the minimum when we start the game
				where['participants.' + gameSession.game.type.minNumberOfParticipants] = {$exists: true};
				GameSession.findOneAndUpdate(where, update,
				                             {select: '-_id -game.type -participants.connection -participants._id'})
				.populate({
					path: 'participants.user',
					select: '-_id displayName avatarImageUrl'})
				.exec(function(err, gameSession) {
					if (err) {
						cb(err);
					} else if (!gameSession) {
						return cb('(insertion attempt) game session either (1) does not exist, (2) already started, or ' +
						          '(3) has not reached the minimum number of participants');
					} else {
						cb(null, gameSession.toObject());
					}
				});
			}
		});
	},
	getGameSession: function(gameSessionId, cb) {
		GameSession.findById(gameSessionId, null, {lean: true})
		.populate({
			path: 'game.type',
			select: 'description name'
		})
		.exec(cb);
	},
	getGameSessionsFromGameTypeNameAndStatus: function(gameTypeName, status, cb) {
		getGameTypeIdFromName(gameTypeName, function(err, gameTypeId) {
			if (err) {
				cb(err);
			} else {
				GameSession.find({game: {type: gameTypeId}, status: status},
					'participants _id', {lean: true},
					function(err, newGameSessions) {
					if (err) {
						cb(err);
					} else {
						cb(null, newGameSessions);
					}
				});
			}
		});
	},
	addParticipant: function(gameSessionId, userId, connection, startWhenReachingMaxNumberOfParticipants, cb) {
		// TODO try to get and update in one atomic operation
		// (complicated since we need to verify the maxNumberOfParticipants and start a new when reaching it)

		var where = {_id: gameSessionId, /*'participants.user': {$ne: userId},*/ status: 'NOT_STARTED'};
		// get and verify the game session
		GameSession.findOne(where, '-_id game.type participants.length')
		.populate({path: 'game.type', select: '-_id name maxNumberOfParticipants'})
		.exec(function(err, gameSession) {
			if (err) {
				cb(err);
			} else if (!gameSession) {
				cb('(initial verification) game session either (1) does not exist, (2) already started, or ' +
				   '(3) the user is already participating in it');
			} else {
				// atomically add the participant

				// ensure that a parallel 'addParticipant' execution didn't reach maxNumberOfParticipants
				where['participants.' + gameSession.game.type.maxNumberOfParticipants] = {$exists: false};
				var update = {$push: {participants: {user: userId, connection: connection}}};

				// start the game if needed
				if (startWhenReachingMaxNumberOfParticipants &&
				    gameSession.participants &&
				    gameSession.participants.length === gameSession.game.type.maxNumberOfParticipants - 1) {
					update.status = 'IN_PROGRESS';
					update['game.state'] = gameSession.game.type.rules.createGameState();
				}

				GameSession.findOneAndUpdate(where, update, {select: '-_id -game.type -participants.connection -participants._id'})
				.populate({
					path: 'participants.user',
					select: '-_id displayName avatarImageUrl'})
				.exec(function(err, gameSession) {
					if (err) {
						cb(err);
					} else if (!gameSession) {
						return cb('(insertion attempt) game session either (1) does not exist, (2) already started, or ' +
						          '(3) the user is already participating in it');
					} else {
						cb(null, gameSession.toObject());
					}
				});
			}
		});
	}
};
