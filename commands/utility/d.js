const { SlashCommandBuilder } = require('discord.js');
const { PASS, USER } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('servertest')
		.setDescription('Répond avec Pong!'),
	async execute(interaction) {
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			host: '127.0.0.1',
			user: USER,
			password: PASS,
			database: 'bot'
		});

		connection.connect();
		connection.query('SELECT * FROM test', async function (error, results, fields) {
			if (error) throw error;
			console.log(results);
			
			console.log('The solution is: ', results[0].nom );
			await interaction.reply('Pong! Temps depuis le message : ' + results[0].nom + 'ms');
		});
	},
};