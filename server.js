'use strict';
const config = require('./config/config');
require('./config/bookshelf');

const express = require('express');
const Promise = require("bluebird");
const line = require('@line/bot-sdk');
const path = require('path');
const fs = require('fs');
const querystring = require("querystring");
const https = require("https");
const app = express();
const errorHandlers = require('./libs/errorhandlers');
const responseTime = require('./libs/response-time');
const client = new line.Client(global.config.line);

app.disable('x-powered-by');
app.use(responseTime());


app.get('/', (req, res) => {
	res.json('Line Bot!');
});

app.post('/webhook', line.middleware(global.config.line), (req, res) => {
	Promise.all(req.body.events.map(handleEvent)).then((result) => {
		res.json(result);
	});
});

app.use(errorHandlers.error);
app.use(errorHandlers.notFound);

global.config.port = process.env.PORT || global.config.port;
app.listen(global.config.port, () => {
	console.info('Config :', process.env.NODE_ENV);
	console.info('Host :', global.config.host);
	console.info('Listening on : ' + global.config.port);
});

const modelUser = require('./models/model_user');
const modelEvent = require('./models/model_event');

const handleEvent = async (event) => {
	const _fetchUser = await modelUser.byLineUserId(event.source.userId);
	if (!_fetchUser) {
		let _lineProfile = await client.getProfile(event.source.userId);
		if (_lineProfile) {
			let objUserSave = {
				line_user_id: _lineProfile.userId,
				name: _lineProfile.displayName,
				image_url: _lineProfile.pictureUrl
			};
			objUserSave = await new modelUser(objUserSave).save();
			objUserSave = objUserSave.toJSON();
			event._userProfile = objUserSave;
		}
	} else {
		event._userProfile = _fetchUser;
	}

	if (event.type === 'message') {
		switch ((event.message.type).toLowerCase()) {
			case 'text':
			case 'location':
				handleMessageEvent(event);
				return Promise.resolve(null);
				break;
			default:
				return Promise.resolve(null);
		}
	} else {
		return Promise.resolve(null);
	}
};

const handleMessageEvent = async (event) => {
	let msg = {
		type: 'text',
		text: `สวัสดีครับ คุณ ${event._userProfile.name}
กรุณาพิมพ์ชื่อร้านอาหาร หรือ share@location ที่คุณต้องการค้นหา`
	};
	if (event.message.type === 'text') {
		let eventText = event.message.text ? event.message.text.toLowerCase() : '';
		switch (eventText) {
			case 'ค้นหา':
				// console.log('switch2 ค้นหา');
				modelEvent.setEvent(event.source.userId, eventText, 1);
				break;
			case 'ค้นหาจากพิกัด':
				// console.log('switch2 ค้นหาจากพิกัด');
				modelEvent.setEvent(event.source.userId, eventText, 1);
				break;
			case 'ยกเลิก':
				// console.log('switch2 ยกเลิก');
				break;
			default:
				// console.log('switch2 default');
				let parameters = {
					query: event.message.text.trim()
				};
				// console.log('parameters', parameters);
				let fetchPlace = await modelPlace.getTextSearch(parameters);
				if (fetchPlace.results && fetchPlace.results.length > 0) {
					msg = [{
						type: 'text',
						text: `ร้านอาหารที่แนะนำ`
					}];
					for (const [index, result] of (fetchPlace.results).entries()) {
						if (index === 3) {
							break;
						}
						if (result) {
							let map = {
								"type": "location",
								"title": (result.name).substring(0, 90) + "...",
								"address": (result.formatted_address).substring(0, 90) + "...",
								"latitude": result.geometry.location.lat,
								"longitude": result.geometry.location.lng
							};
							msg.push(map);
						}
					}
				} else {
					msg = {
						type: 'text',
						text: `ไม่พบร้านอาหารที่คุณค้นหา`
					}
				}
		}
	} else if (event.message.type === 'location') {
		if (event.message.latitude && event.message.longitude) {
			let parameters = {
				location: event.message.latitude + ',' + event.message.longitude
			};
			let fetchPlace = await modelPlace.getNearbySearch(parameters);
			if (fetchPlace.results && fetchPlace.results.length > 0) {
				msg = [{
					type: 'text',
					text: `ร้านอาหารที่แนะนำ`
				}];
				for (const [index, result] of (fetchPlace.results).entries()) {
					if (index === 3) {
						break;
					}
					if (result) {
						let map = {
							"type": "location",
							"title": (result.name).substring(0, 90) + "...",
							"address": (result.vicinity).substring(0, 90) + "...",
							"latitude": result.geometry.location.lat,
							"longitude": result.geometry.location.lng
						};
						msg.push(map);
					}
				}
			} else {
				msg = {
					type: 'text',
					text: `ไม่พบร้านอาหารที่คุณค้นหา`
				}
			}
		}
	} else {
		msg = {
			type: 'text',
			text: `กรุณาพิมพ์ชื่อร้านอาหาร หรือ share location ที่คุณต้องการค้นหา`
		};
	}
	return client.replyMessage(event.replyToken, msg);
};

const modelPlace = {
	getTextSearch: (parameters) => {
		console.log('### Model modelPlace.getTextSearch', parameters);
		return new Promise((resolve, reject) => {
			const outputFormat = global.config.google.placesOutputFormat;
			parameters.key = global.config.google.placesApiKey;
			if (parameters.query) parameters.query = parameters.query;
			else delete parameters.query;
			parameters.sensor = parameters.sensor || false;
			parameters._ = (new Date()).getTime().toString(36);
			const url = "https://maps.googleapis.com/maps/api/place/textsearch/" + outputFormat + "?region=th&type=restaurant&" + querystring.stringify(parameters);
			https.get(url, (response) => {
				let responseData = "";
				response.setEncoding("utf8");
				response.on("data", function (chunk) {
					responseData += chunk;
				});
				response.on("end", function () {
					try {
						responseData = JSON.parse(responseData);
						if (responseData.status !== 'OK' && responseData.status !== 'OVER_QUERY_LIMIT') {
							let error = new Error(responseData.error_message || responseData.status);
							error.name = responseData.status;
							throw error;
						}
					} catch (e) {
						console.error("Got responseData.status error: " + e.message);
						return reject(e);
					}
					return resolve(responseData);
				});

			}).on('error', function (e) {
				console.error("Got error: " + e.message);
				return reject(e);
			});

		});
	},
	getNearbySearch: (parameters) => {
		console.log('### Model modelPlace.getNearbySearch');
		return new Promise((resolve, reject) => {
			if (!parameters.location) return resolve(false);
			const outputFormat = global.config.google.placesOutputFormat;
			parameters.key = global.config.google.placesApiKey;
			parameters.sensor = parameters.sensor || false;
			parameters._ = (new Date()).getTime().toString(36);
			const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/" + outputFormat + "?region=th&type=restaurant&radius=1500&" + querystring.stringify(parameters);
			https.get(url, (response) => {
				let responseData = "";
				response.setEncoding("utf8");
				response.on("data", function (chunk) {
					responseData += chunk;
				});
				response.on("end", function () {
					try {
						responseData = JSON.parse(responseData);
						if (responseData.status !== 'OK' && responseData.status !== 'OVER_QUERY_LIMIT') {
							let error = new Error(responseData.error_message || responseData.status);
							error.name = responseData.status;
							throw error;
						}
					} catch (e) {
						console.error("Got responseData.status error: " + e.message);
						return reject(e);
					}
					return resolve(responseData);
				});

			}).on('error', function (e) {
				console.error("Got error: " + e.message);
				return reject(e);
			});

		});
	},
};
