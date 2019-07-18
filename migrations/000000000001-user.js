exports.up = function (knex, Promise) {
	return Promise.all([
		knex.schema.createTable('user', function (table) {
			table.bigIncrements('id', 20).unique();
			table.string('line_user_id').unique();
			table.string('name');
			table.text('image_url', 'mediumtext');
			table.timestamps();
		}),

	]);
};
exports.down = function(knex, Promise) {
	return Promise.all([])
};
