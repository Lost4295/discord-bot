const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('allactions')
		.setDescription('Pour voir les points obtenus.')
		.addUserOption(option => option.setName('user').setDescription('L\'utilisateur dont vous voulez voir les points.')),
	async execute(interaction) {
		const pool = require("../../db.js");
		const user = interaction.options.getUser('user') ?? interaction.user;
		let message = '';
		pool.getConnection(async function (err, connection) {
			await interaction.deferReply();
			connection.query('SELECT pseudo, points FROM users where user_id = ' + user.id, async function (error, results) {
				if (error) throw error;
				console.log(results);
				if (results.length == 0) {
					await interaction.editReply('Vous n\'êtes pas inscrit dans la base de données de Couch Bot. ');
				} else if (results[0].visibility == 0 && interaction.user.id != user.id && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					await interaction.editReply(user.username + ' a choisi de ne pas rendre ses points visibles.');
				} else {
					message += 'Points obtenus par ' + results[0].pseudo + '\n';
					message += 'Vous avez actuellement ' + results[0].points + ' points. \n\n';
					connection.query('SELECT * FROM points where user_id = ' + user.id, async function (error, results) {
						if (error) throw error;
						console.log(results);
						if (results.length != 0) {
							for (let i = 0; i < results.length; i++) {
								if (results[i].points < 0) {
									message += '## Perte de Points\n' + results[i].points * -1 + " points perdus le " + results[i].date + " pour la raison suivante : " + results[i].reason + '\n';
								} else {
									message += '## Gain de Points\n' + results[i].points + " points gagnés le " + results[i].date + " pour la raison suivante : " + results[i].reason + '\n';
								}
							}
						}
						if (message.length> 2000) {
							await interaction.reply('Le message est trop long pour être envoyé en une seule fois. Veuillez consulter votre messagerie privée.');
							while (message.length > 0) {
								await interaction.user.send(message.slice(0, 2000));
								message = message.slice(2000);
							}
						} else {
							await interaction.reply(message);
						}
					});
				}
			});
			pool.releaseConnection(connection);
		});
	}
};