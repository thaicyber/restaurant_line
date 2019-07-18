'use strict';

const bookshelf = require('../config/bookshelf');

let dbUser = bookshelf.Model.extend({
	tableName: 'user',
	hasTimestamps: true,
}, {
	byLineUserId: function (lineUserId) {
		return this.forge().query(function (qb) {
			qb.where({ line_user_id: lineUserId });
		}).fetch().then(function (_fatchUser) {
			if (_fatchUser) {
				_fatchUser = _fatchUser.toJSON();
				return _fatchUser;
			} else {
				return false;
			}
		});
	},
});

module.exports = bookshelf.model('dbUser', dbUser);
