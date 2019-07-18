exports.up = function (knex, Promise) {
	return Promise.all([
		knex.schema.createTable('event', function (table) {
			table.string('line_user_id').unique();
			table.string('command');
			table.integer('status', 2).defaultTo(0);
			table.timestamps();
		}),

	]);
};
exports.down = function(knex, Promise) {
	return Promise.all([])
};
