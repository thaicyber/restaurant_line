'use strict';

exports.notFound = (req, res, next) => {
	console.log('notFound404', req.method, req.originalUrl);
	res.status(404).json('notFound');
};

exports.error = (err, req, res, next) => {
	console.error('error500', req.method, req.originalUrl, err);
	res.status(500).json({ error: err.message, stack: err.stack, ts: Date.now() });
};
