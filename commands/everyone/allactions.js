const { SlashCommandBuilder } = require('discord.js');
const { PASS, USER } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('allactions')
		.setDescription('Pour voir les points obtenus.')
		.addUserOption(option => option.setName('user').setDescription('L\'utilisateur dont vous voulez voir les points.')),
	async execute(interaction) {
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			host: '127.0.0.1',
			user: USER,
			password: PASS,
			database: 'bot'
		});
		var user = interaction.options.getUser('user') ?? interaction.user;
		let message = '';
		connection.connect();
		connection.query('SELECT pseudo, points FROM users where user_id = ' + user.id, async function (error, results, fields) {
			if (error) throw error;
			console.log(results);
			if (results.length == 0) {
				await interaction.reply('Vous n\'êtes pas inscrit dans la base de données de Couch Bot. ');
			} else if (results[0].visibility == 0 && interaction.user.id != user.id && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				await interaction.reply(user.username + ' a choisi de ne pas rendre ses points visibles.');
			} else {
				message += 'Points obtenus par ' + results[0].pseudo + '\n';
				message += 'Vous avez actuellement ' + results[0].points + ' points. \n\n';
				connection.query('SELECT * FROM points where user_id = ' + user.id, async function (error, results, fields) {
					if (error) throw error;
					console.log(results);
					if (results.length != 0) {
						for (i = 0; i < results.length; i++) {
							if (results[i].points < 0) {
								message += '## Perte de Points\n' + results[i].points * -1 + " points perdus le " + results[i].date + " pour la raison suivante : " + results[i].reason + '\n';
							} else {
								message += '## Gain de Points\n' + results[i].points + " points gagnés le " + results[i].date + " pour la raison suivante : " + results[i].reason + '\n';
							}
						}
					}
					await interaction.reply(message);
				});
			}
		});
	}
};