'use strict';

var mongoose = require('mongoose');

var GameTypeSchema = new mongoose.Schema({
	name: {
		type: String,
		match: /^[a-z][a-z0-9_]{0,31}$/,
		index: {
			unique: true
		},
		required: true
	},
	description: String
});

module.exports = mongoose.model('GameType', GameTypeSchema);
