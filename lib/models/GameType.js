'use strict';

try {
	var mongoose = require('mongoose');
} catch (_) {
	// workaround when `npm link`'ed for development
	var prequire = require('parent-require')
		, mongoose = prequire('mongoose');
}

var GameTypeSchema = new mongoose.Schema({
	name: {
		type: String,
		match: /^[a-z][a-z0-9_]{0,31}$/,
		index: {
			unique: true
		},
		required: true
	},
	description: String,
	maxNumberOfParticipants: {type: Number, min: 1, required: true},
	minNumberOfParticipants: {type: Number, min: 1, required: true}
});

GameTypeSchema.virtual('rules')
.get(function() {
	return require('../games/' + this.name);
});

module.exports = mongoose.model('GameType', GameTypeSchema);
