const gulp = require('gulp');
const nodemon = require('gulp-nodemon');

// DEV Task
gulp.task('dev', function (done) {
	const options = {
		script: 'server.js',
		ext: 'js html ',
		ignore: ['node_modules/', 'public/'],
		env: { 'NODE_ENV': 'development' },
		legacyWatch: true
	};
	nodemon(options)
		.on('change', function () {
			console.log('gulp nodemon: app changed.');
		})
		.on('restart', function () {
			// console.log('gulp nodemon: app restarted.');
		});
	done();
});

// Night task
gulp.task('night', function (done) {
	const options = {
		script: 'server.js',
		ext: 'js html ',
		ignore: ['node_modules/', 'public/', 'libs/', 'views/'],
		env: { 'NODE_ENV': 'night' },
		legacyWatch: true
	};
	nodemon(options)
		.on('change', function () {
			console.log('gulp nodemon: app changed.');
		})
		.on('restart', function () {
			// console.log('gulp nodemon: app restarted.');
		});
	done();
});