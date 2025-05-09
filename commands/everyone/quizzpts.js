const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getquizzpts')
		.setDescription('Pour voir les points obtenus aux quizzes.')
		.addUserOption(option => option.setName('user').setDescription('L\'utilisateur dont vous voulez voir les points.')),
	async execute(interaction) {
		const pool = require("../../db.js");
		pool.getConnection(async function (err, connection) {
			const user = interaction.options.getUser('user') ?? interaction.user;
			let exampleEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setThumbnail(user.avatarURL())
				.setTimestamp()
				.setFooter({ text: 'Couch Bot' });

			const member = interaction.guild.members.cache.get(interaction.user.id);
			await interaction.deferReply();
			connection.query('SELECT quizzpoints FROM users where user_id = ' + user.id, async function (error, results) {
				if (error) throw error;
				console.log(results);
				if (results.length == 0) {
					await interaction.editReply({content:user.username + ' n\'est inscrit dans la base de données de Couch Bot. '});
				} else if (results[0].visibility == 0 && interaction.user.id != user.id && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					await interaction.editReply({content:user.username + ' a choisi de ne pas rendre ses points visibles.'});
				} else {
					exampleEmbed.setTitle('Points obtenus par ' + user.username);
					exampleEmbed.setDescription('Vous avez actuellement ' + results[0].quizzpoints + ' points.');
					connection.query('SELECT * FROM quizzpoints where user_id = ' + user.id, async function (error, results) {
						if (error) throw error;
						console.log(results);
						if (results.length == 0) {
							exampleEmbed.addFields({ name: 'Points', value: 'Vous n\'avez pas de points.', inline: true });
						} else {
							for (let i = 0; i < results.length; i++) {
								if (i <= 23) {
									exampleEmbed.addFields({ name: 'Gain de Points', value: results[i].points + " points gagnés le " + results[i].date, inline: true });
								} else {
									exampleEmbed.addFields({ name: 'Autres', value: 'Les autres actions ne sont pas visibles. Pour en avoir un aperçu, veuillez exécuter la commande /allactions.', inline: true });
									break;
								}
							}
						}
						await interaction.editReply({ embeds: [exampleEmbed] });
					});
				}
			});
			pool.releaseConnection(connection);
		});

	}
};