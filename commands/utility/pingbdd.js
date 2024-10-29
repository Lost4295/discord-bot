const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pingbdd')
		.setDescription('Teste la connexion à la base de données.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.setDMPermission(false),
	async execute(interaction) {

		const pool = require("../../db.js");
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log(err);
				interaction.reply('La base de données ne fonctionne pas.');
				pool.releaseConnection(connection);
				return;
			}
		connection.query('SELECT 1 as ok', async function (error, results) {
			if (error) throw error;
			console.log(results);
			await interaction.reply('La base de données fonctionne correctement.');
		});
        pool.releaseConnection(connection);
	});
	},
};