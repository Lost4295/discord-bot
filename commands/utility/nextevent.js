const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('nextevent')
		.setDescription('Donne la date du prochain événement.')
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
			connection.query('SELECT * from dates WHERE date > NOW()ORDER BY date ASC LIMIT 1', async function (error, resultats, fields) {
				if (error) throw error;
				console.log(resultats);
				if (resultats.length == 0) {
					await interaction.reply('Aucun événement n\'est prévu pour le moment.');
				}
				else {
					await interaction.reply(`Le prochain événement est prévu le __${resultats[0].date}__ : ${resultats[0].title}. Il est **${resultats[0].distanciel ? 'en distanciel' : 'en présentiel'}**.`);
				}
			});
			pool.releaseConnection(connection);
		});
	},
};