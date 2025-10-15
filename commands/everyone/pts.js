//TODO : refaire

const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getpts')
		.setDescription('Pour voir les points obtenus')
		.addStringOption(option => option.setName('trimestre').setDescription("Quel trimestre vous aimeriez voir.").setChoices(
			{ value: "1", name: "Trimestre 1" },
			{ value: "2", name: "Trimestre 2" },
			{ value: "3", name: "Trimestre 3" },
		).setRequired(true))
		.addUserOption(option => option.setName('user').setDescription('L\'utilisateur dont vous voulez voir les points.')),
	async execute(interaction) {
		const pool = require("../../db.js");
		// await interaction.reply("Cette commande ne fonctionne pas pour l'instant, mais elle le sera très vite ! Demandez à <@349983254373466114> pour avoir la réponse à votre demande.");
		pool.getConnection(async function (err, connection) {
			await interaction.deferReply();
			const user = interaction.options.getUser('user') ?? interaction.user;
			const trimestre = interaction.options.getString('trimestre');
			switch (trimestre) {
				case "1":
					fq = "SELECT date_debut, date_fin FROM trimestre WHERE trimestre = 1 AND niveau = ?;";
					break;
				case "2":
					fq = "SELECT date_debut, date_fin FROM trimestre WHERE trimestre = 2 AND niveau = ?;";
					break;
				case "3":
					fq = "SELECT date_debut, date_fin FROM trimestre WHERE trimestre = 3 AND niveau = ?;";
					break;
				default:
					await interaction.editReply({ content: "Le trimestre doit être 1, 2 ou 3." });
					return;
			}
			connection.query('SELECT classe as niveau,pseudo,visibility,is_admin FROM users WHERE id = ?', [user.id], async function (error, theuser) {
				if (error) throw error;
				if (theuser.length == 0) {
					await interaction.editReply({ content: user.username + ' n\'est inscrit dans la base de données de Couch Bot. ' });
					return;
				}
				if (theuser[0].niveau == null) {
					await interaction.editReply({ content: user.username + ' n\'a pas de classe enregistrée dans la base de données de Couch Bot. ' });
					return;
				}
				if (theuser[0].visibility == 0 && interaction.user.id != user.id && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					await interaction.editReply({ content: user.username + ' a choisi de ne pas rendre ses points visibles.' });
					return;
				}
				niveau = theuser[0].niveau;
				connection.query(fq, [niveau], async function (error, dates) {
					if (error) throw error;
					if (dates.length == 0) {
						await interaction.editReply({ content: 'Il n\'y a pas de dates enregistrées pour le trimestre ' + trimestre + ' et le niveau "' + niveau + '".' });
						return;
					}
					// select sum(points.points) as Total, user_id from points group by user_id;
					// SELECT u.id AS user_id, COALESCE(SUM(p.points), 0) AS total_points FROM users u LEFT JOIN points p ON p.user_id = u.id     AND p.date BETWEEN NOW()- INTERVAL 2 DAY AND NOW()  -- ta condition de date WHERE u.id = 1 GROUP BY u.id;
					let exampleEmbed = new EmbedBuilder()
						.setColor(0x0099FF)
						.setThumbnail(user.avatarURL())
						.setTimestamp()
						.setFooter({ text: 'Couch Bot' });
					console.log(trimestre);
					if (error) throw error;
					let desc;
					if (interaction.user.id != user.id) {
						desc = theuser[0].pseudo + ' a';
					} else {
						desc = 'Vous avez';
					}

					exampleEmbed.setTitle('Points obtenus par ' + theuser[0].pseudo);

					let query2 = "SELECT u.id AS user_id,COALESCE(SUM(p.points), 0) AS total_points FROM users u LEFT JOIN points p ON p.user_id = u.id AND p.date BETWEEN ? AND ? WHERE u.id = ? GROUP BY u.id";
					connection.query(query2, [startDate, endDate, user.id], async function (error, mypts) {

						desc += ' actuellement ' + mypts[0].total_points + ' points.';

						if (mypts[0].total_points >= 4 && theuser[0].is_admin == 0) {
							desc += " Votre note sera cependant limitée à 4 points.";
						} else if (mypts[0].total_points >= 6 && theuser[0].is_admin == 1) {
							desc += " Votre note sera cependant limitée à 6 points.";
						}

						desc+= " La fin de ce trimestre est le " + dates[0].date_fin + ".";

						exampleEmbed.setDescription(desc);

						if (error) throw error;
						let query3 = "SELECT points, reason, date FROM points WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC";
						connection.query(query3, [user.id, startDate, endDate], async function (error, results) {
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
										break;
									}
								}
							}
							await interaction.editReply({ embeds: [exampleEmbed] });
						});

					}
					)
				});
			});
			pool.releaseConnection(connection);
		});
	}
}
