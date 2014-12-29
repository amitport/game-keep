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
	createGameSession: function(gameTypeName, cb) {
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
	getNotStartedGameSessions: function(gameTypeName, cb) {
		getGameTypeIdFromName(gameTypeName, function(err, gameTypeId) {
			if (err) {
				cb(err);
			} else {
				GameSession.find({game: {type: gameTypeId}, status: 'NOT_STARTED'},
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
	addParticipant: function(gameSessionId, userId, connection, cb) {
		GameSession.findOneAndUpdate(
			{
				_id: gameSessionId,
				'participants.3': {$exists: false} // ensures that there is no more than 3 participants
			},
			{$push: {participants: {user: userId, connection: connection}}},
			{select: '-_id -game.type -participants.connection -participants._id'},
			function(err, gameSession) {
				if (err) {
					cb(err);
				} else if (!gameSession) {
					return cb('gameSession not found');
				} else {
					if (gameSession.participants.length === 4) {
						//TODO create gameSession.game.state
						gameSession.status = 'ACTIVE';
						gameSession.save(function(err) {
							if (err) {
								cb(err);
							} else {
								cb(null, gameSession.toObject());
							}
						});
					} else {
						cb(null, gameSession.toObject());
					}
				}
			});
	}
};
