'use strict';

var GameType = require('./models/GameType');

module.exports = {
	getAllGameTypes: function(cb) {
		GameType.find({}, null, {lean: true}, cb);
	},
	getGameTypeByName: function(name, cb) {
		GameType.findOne({name: name.toLowerCase()}, null, {lean: true}, cb);
	}
};
