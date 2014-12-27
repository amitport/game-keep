'use strict';

module.exports = {
	mongo: {
		uri: process.env.MONGOHQ_URL
	},
	auth: {
		tokenSecret: process.env.TOKEN_SECRET
	}
};
