'use strict';

const bookshelf = require('../config/bookshelf');

let dbEvent = bookshelf.Model.extend({
	tableName: 'event',
	hasTimestamps: true,
}, {
	getEvent: function (lineUserId) {
		return this.forge().query(function (qb) {
			qb.where({ line_user_id: lineUserId });
		}).fetch().then(function (_fatchEvent) {
			if (_fatchEvent) {
				_fatchEvent = _fatchEvent.toJSON();
				return _fatchEvent;
			} else {
				return false;
			}
		});
	},
	setEvent: function (lineUserId, command = '', status = 0) {
		if(!lineUserId) return false;
		let thisModel = this;
		let objSave = {
			line_user_id: lineUserId,
			command: command,
			status: status
		};
		return thisModel.forge().query(function (qb) {
			qb.where({ line_user_id: lineUserId });
		}).fetch().then(function (_fatchEvent) {
			if (!_fatchEvent) {
				console.log('## model dbEvent.setEvent : Instert');
				return new thisModel(objSave).save().then(function (_data) {
					return true;
				});
			} else {
				console.log('## model dbEvent.setEvent : Update');
				return thisModel.forge().where({ line_user_id: lineUserId }).save(objSave, { patch: true }).then(function () {
					return true;
				});
			}
		});
	},
});

module.exports = bookshelf.model('dbEvent', dbEvent);
