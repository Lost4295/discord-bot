const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('nextevent')
		.setDescription('Donne la date du prochain événement.')
		.setDMPermission(false),
	async execute(interaction) {

		const pool = require("../../db.js");
		pool.getConnection(async function (err, connection) {
			if (err) {
				console.log(err);
				interaction.reply({content:'La base de données ne fonctionne pas.'});
				pool.releaseConnection(connection);
				return;
			}
			await interaction.deferReply();
			connection.query('SELECT * from dates WHERE date > NOW() ORDER BY date ASC LIMIT 1', async function (error, resultats) {
				if (error) throw error;
				console.log(resultats);
				if (resultats.length == 0) {
					await interaction.editReply({content:'Aucun événement n\'est prévu pour le moment.'});
				}
				else {
					await interaction.editReply({content:`Le prochain événement est prévu le __${resultats[0].date}__ : ${resultats[0].title}. Il est **${resultats[0].distanciel ? 'en distanciel' : 'en présentiel'}**.`});
				}
			});
			pool.releaseConnection(connection);
		});
	},
};