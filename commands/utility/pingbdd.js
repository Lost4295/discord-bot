const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pingbdd')
		.setDescription('Teste la connexion à la base de données.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
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
		connection.query('SELECT 1 as ok', async function (error, results, fields) {
			if (error) throw error;
			console.log(results);
			await interaction.reply('La base de données fonctionne correctement.');
		});
	},
};