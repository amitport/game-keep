'use strict';

var mongoose = require('mongoose');

var GameTypeSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		match: /^[a-z][a-z0-9_]{0,31}$/,
		index: {
			unique: true
		}
	},
	description: String
});

var GameType = mongoose.model('GameType', GameTypeSchema);

module.exports = {
	getAll: function(cb) {
		GameType.find({}, null, {lean: true}, cb);
	},
	getByName: function(name, cb) {
		GameType.findOne({name: name.toLowerCase()}, null, {lean: true}, cb);
	}
};
