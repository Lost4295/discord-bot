const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Donne la liste des cinq meilleurs joueurs.')
		.addBooleanOption(option =>
			option
				.setName('quizz')
				.setDescription('Voir le leaderboard des quizzes.')
				.setRequired(false)
		)
		.addBooleanOption(option =>
			option
				.setName('full')
				.setDescription('Voir tout le leaderboard.')
				.setRequired(false)
		)
		.addStringOption(option =>
			option
				.setName('semestre')
				.setDescription("Quel Semestre vous aimeriez voir.")
				.setChoices(
					{ value: "1", name: "Semestre 1" },
					{ value: "2", name: "Semestre 2" },
				))
		.setDMPermission(false),
	async execute(interaction) {

		const quizz = interaction.options.getBoolean('quizz') ?? false;
		const full = interaction.options.getBoolean('full') ?? false;
		const semestre = interaction.options.getString('semestre') ?? "1";
		const pool = require("../../db.js");
		pool.getConnection(async function (err, connection) {
			await interaction.deferReply();
			let query;
			let query2;
			let ss2 = false;
			if (quizz) {
				query = 'SELECT * from users WHERE visibility=1 ORDER BY quizzpoints DESC';
				query2 = 'SELECT * from users ORDER BY quizzpoints DESC';
			} else if (semestre == "1") {
				query = 'SELECT * from users WHERE visibility=1 ORDER BY points DESC';
				query2 = 'SELECT * from users ORDER BY points DESC';
			} else if (semestre == "2") {
				query = 'SELECT * from users WHERE visibility=1 ORDER BY points_s2 DESC';
				query2 = 'SELECT * from users ORDER BY points_s2 DESC';
				ss2 = true;
			}

			connection.query(query, async function (error, resultats) {
				if (error) throw error;
				console.log(resultats);
				if (full) {
					let message = 'Voici les meilleurs joueurs publics de Couch Bot.\n';
					let len = resultats.length;
					if (len == 0) {
						message += 'Aucun joueur n\'a encore de points et les a rendu publics.';
					}
					for (let i = 0; i < len; i++) {
						let points;
						if (quizz){
							points = resultats[i].quizzpoints;
						} else if (ss2){
							points = resultats[i].points_s2;
						} else {
							points =resultats[i].points;
						}
						message += ` - ${i + 1} ${resultats[i].pseudo} Points : ${points} \n`;
					}
					let messageLength = message.length;
					if (messageLength > 2000) {
						await interaction.editReply(message.slice(0, 2000));
						while (message.length > 0) {
							await interaction.followUp(message.slice(0, 2000));
							message = message.slice(2000);
						}
					} else {
						await interaction.editReply(message);
					}
				} else {
					let embed = new EmbedBuilder()
						.setTitle('Leaderboard')
						.setDescription('Voici les meilleurs joueurs publics de Couch Bot.')
						.setColor('#0099ff');
					let len = (resultats.length > 5) ? 5 : resultats.length;
					if (len == 0) {
						embed.addFields({ name: 'Pas de joueur', value: 'Aucun joueur n\'a encore de points et les a rendu publics.' });
					}
					for (let i = 0; i < len; i++) {
						let points;
						if (quizz){
							points = resultats[i].quizzpoints;
						} else if (ss2){
							points = resultats[i].points_s2;
						} else {
							points =resultats[i].points;
						}
						embed.addFields({ name: ` #${i + 1} ${resultats[i].pseudo}`, value: `Points : ${points}` });
					}
					embed.addFields(
						{ name: '\u200B', value: '\u200B' },
					);
					connection.query('SELECT * from users WHERE user_id = ' + interaction.user.id, async function (error, results) {
						if (error) throw error;
						connection.query(query2, async function (error, aa) {
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
								let points;
								if (quizz){
									points = results[0].quizzpoints;
								} else if (ss2){
									points = results[0].points_s2;
								} else {
									points =results[0].points;
								}
								embed.addFields({ name: `Votre position`, value: position + "", inline: true }, { name: `Vos points`, value: points + "", inline: true })
							}
							await interaction.editReply({ embeds: [embed] });
						});
					});
				}
			});
			pool.releaseConnection(connection);
		});
	},
};