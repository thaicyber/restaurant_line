'use strict';

console.info('config:', process.env.NODE_ENV);
let config = {
	domain: 'localhost',
	host: 'http://localhost:5011',
	port: 5011,
	line:{
		channelAccessToken: "",
		channelSecret: ""
	},
	google: {
		placesApiKey: null,
		placesOutputFormat: 'json'
	},
};
if (process.env.NODE_ENV == 'development') {
	config.domain = 'localhost';
	config.host = 'http://localhost:5011';
	config.port = 5011;
	config.line.channelAccessToken = "";
	config.line.channelSecret = "";
	config.google.placesApiKey = '';
}
else {
	console.log(`########## Error :: NODE_ENV='${process.env.NODE_ENV}' No config value! ##########`);
	process.exit(1);
}

global.config = config;

module.exports = config;
