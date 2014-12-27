'use strict';

var mongoose = require('mongoose');
var jwt = require('jwt-simple');
var moment = require('moment');
var validators = require('mongoose-validators');

var tokenSecret = require('config').get('auth.tokenSecret');

var UserSchema = new mongoose.Schema({
	displayName: {
		type: String,
		unique: true,
		required: true
	},
	email: {
		type: String,
		lowercase: true,
		validate: validators.isEmail(),
		unique: true,
		required: true
	},
	avatarImageUrl: {
		type: String,
		validate: validators.isURL()
	},
	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user'
	},
	linkedProviders: {
		google: String
	}
});

// Public profile information
UserSchema
	.virtual('publicProfile')
	.get(function() {
		return {
			displayName: this.displayName,
			avatarImageUrl: this.avatarImageUrl
		};
	});

// Non-sensitive info we'll be putting in the token
UserSchema
	.virtual('token')
	.get(function() {
		return jwt.encode({
				sub: this._id,
				iat: moment().unix(),

				role: this.role
			},
			tokenSecret);
	});

module.exports = mongoose.model('User', UserSchema);
