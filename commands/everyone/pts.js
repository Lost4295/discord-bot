const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { PASS, USER } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getpts')
		.setDescription('Pour voir les points obtenus.')
		.addUserOption(option => option.setName('user').setDescription('L\'utilisateur dont vous voulez voir les points.')),
	async execute(interaction) {
		const pool = require("../../db.js");
		pool.getConnection(function (err, connection) {
			const user = interaction.options.getUser('user') ?? interaction.user;
			let exampleEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setThumbnail(user.avatarURL())
				.setTimestamp()
				.setFooter({ text: 'Couch Bot' });

			const member = interaction.guild.members.cache.get(interaction.user.id);
			connection.query('SELECT pseudo, points, visibility FROM users where user_id = ' + user.id, async function (error, results, fields) {
				if (error) throw error;
				console.log(results);
				if (results.length == 0) {
					await interaction.reply(user.username + ' n\'est inscrit dans la base de données de Couch Bot. ');
				} else if (results[0].visibility == 0 && interaction.user.id != user.id && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					await interaction.reply(user.username + ' a choisi de ne pas rendre ses points visibles.');
				} else {
					exampleEmbed.setTitle('Points obtenus par ' + results[0].pseudo);
					exampleEmbed.setDescription('Vous avez actuellement ' + results[0].points + ' points.');
					connection.query('SELECT * FROM points where user_id = ' + user.id, async function (error, results, fields) {
						if (error) throw error;
						console.log(results);
						if (results.length == 0) {
							exampleEmbed.addFields({ name: 'Points', value: 'Vous n\'avez pas de points.', inline: true });
						} else {
							for (let i = 0; i < results.length; i++) {
								if (i <= 23) {
									if (results[i].points < 0) {
										exampleEmbed.addFields({ name: 'Perte de Points', value: results[i].points * -1 + " points perdus le " + results[i].date + " pour la raison suivante : " + results[i].reason, inline: true });
									} else {
										exampleEmbed.addFields({ name: 'Gain de Points', value: results[i].points + " points gagnés le " + results[i].date + " pour la raison suivante : " + results[i].reason, inline: true });
									}
								} else {
									exampleEmbed.addFields({ name: 'Autres', value: 'Les autres actions ne sont pas visibles. Pour en avoir un aperçu, veuillez exécuter la commande /allactions.', inline: true });
								}
							}

						}
						await interaction.reply({ embeds: [exampleEmbed] });
					});
				}
			});
			pool.releaseConnection(connection);
		});

	}
};