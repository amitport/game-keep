'use strict';

var mongoose = require('mongoose');

var GameSessionSchema = new mongoose.Schema({
	game: {
		type: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'GameType',
			required: true
		},
		state: mongoose.Schema.Types.Mixed
	},
	status: {
		type: String,
		enum: ['NOT_STARTED', 'ACTIVE', 'DONE'],
		default: 'NOT_STARTED'
	},
	participants: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User' //must include fields 'displayName' and 'avatarImageUrl'
			},
			connection: {
				type: String,
				required: true
			}
		}
	]
});

GameSessionSchema.index({'game.ttype': 1, status: 1});

module.exports = mongoose.model('GameSession', GameSessionSchema);
