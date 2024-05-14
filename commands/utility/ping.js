const { SlashCommandBuilder } = require('discord.js');
const { PASS, USER } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Répond avec Pong!'),
	async execute(interaction) {
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			host: 'localhost',
			user: USER,
			password: PASS,
			database: 'bot'
		});

		connection.connect();
		connection.query('SELECT 1', function (error, results, fields) {
			if (error) throw error;
			console.log('The solution is: ', results[0].solution);
		});
		await interaction.reply('Pong!');
	},
};