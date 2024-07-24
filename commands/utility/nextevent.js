const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { PASS, USER } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nextevent')
		.setDescription('Donne la date du prochain événement.')
		.setDMPermission(false),
	async execute(interaction) {

		var mysql = require('mysql');
		var connection = mysql.createConnection({
			host: '127.0.0.1',
			user: USER,
			password: PASS,
			database: 'bot'
		});
		connection.connect();
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
        
	},
};