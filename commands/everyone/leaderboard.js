const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Donne la liste des meilleurs joueurs.')
		.setDMPermission(false),
	async execute(interaction) {

		const pool = require("../../db.js");
		pool.getConnection(async function (err, connection) {
			await interaction.deferReply();
			connection.query('SELECT * from users WHERE points > 0 AND visibility=1 ORDER BY points DESC', async function (error, resultats) {
				if (error) throw error;
				console.log(resultats);
				let embed = new EmbedBuilder()
					.setTitle('Leaderboard')
					.setDescription('Voici les meilleurs joueurs publics de Couch Bot.')
					.setColor('#0099ff');
				let len = resultats.length > 5 ? 5 : resultats.length;
				if (len == 0) {
					embed.addFields({ name: 'Pas de joueur', value: 'Aucun joueur n\'a encore de points et les a rendu publics.' });
				}
				for (let i = 0; i < len; i++) {
					embed.addFields({ name: ` #${i + 1} ${resultats[i].pseudo}`, value: `Points : ${resultats[i].points}` });
				}
				embed.addFields(
					{ name: '\u200B', value: '\u200B' },
				);
				connection.query('SELECT * from users WHERE user_id = ' + interaction.user.id, async function (error, results) {
					if (error) throw error;
					connection.query('SELECT * from users WHERE points > 0 ORDER BY points DESC', async function (error, aa) {
						if (error) throw error;
						let position = 0;
						for (let i = 0; i < aa.length; i++) {
							if (aa[i].user_id == interaction.user.id) {
								position = i + 1;
								break;
							}
						}
						if (results.length == 0) {
							embed.addFields({ name: 'Votre position', value: 'Vous n\'êtes pas inscrit dans la base de données de Couch Bot.' })
						} else {
							embed.addFields({ name: `Votre position`, value: position + "", inline: true }, { name: `Vos points`, value: results[0].points + "", inline: true })
						}
						await interaction.editReply({ embeds: [embed] });
					});
				});
			});
			pool.releaseConnection(connection);
		});
	},
};