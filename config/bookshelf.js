const path = require('path');
const fs = require('fs');
const dbFile = path.join(__dirname, '../database/', 'line.sqlite');

const basePathDB = path.join(__dirname, '../database/');
if (!fs.existsSync(basePathDB)) {
	fs.mkdirSync(basePathDB)
}

console.info('sqlite3: file: %s', dbFile);
const knex = require('knex')({
	client: 'sqlite3',
	connection: { filename: dbFile },
	useNullAsDefault: true,
	// debug: true
});
const bookshelf = require('bookshelf')(knex);

bookshelf.plugin('virtuals');
bookshelf.plugin('visibility');
bookshelf.plugin('pagination');
bookshelf.plugin('registry');

checkConnection();

function checkConnection() {
	// if (fs.existsSync(dbFile)) {
		console.log('sqlite3: connection');
		return knex.migrate.latest().then(function (_migrate) {
			console.log('sqlite3: migrations', _migrate);
		}).catch(function (error) {
			console.error('sqlite3: migrations error', error);
		});
	// } else {
	// 	console.error('sqlite3: connection error');
	// 	setTimeout(checkConnection, 2000);
	// 	// process.exit(1);
	// }
}

module.exports = bookshelf;
