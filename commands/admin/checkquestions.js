const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('checkquestions')
		.setDescription('Vérifie les questions.')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommandGroup(group =>
			group
				.setName('see')
				.setDescription('Gérer les questions')
				.addSubcommand(option =>
					option
						.setName('all')
						.setDescription('Voir toutes les questions.'))
				.addSubcommand(option =>
					option
						.setName('number')
						.setDescription('Voir une question.')
						.addStringOption(option =>
							option
								.setName('id')
								.setDescription('ID de la question.')
								.setRequired(true))))
	,
	async execute(interaction) {
		const pool = require("../../db.js");
		pool.getConnection(async function (err, connection) {
			await interaction.deferReply();
			if (interaction.options.getSubcommandGroup() === 'see') {
				if (interaction.options.getSubcommand() === 'all') {
					connection.query('SELECT * from questions WHERE verified = 0', async function (error, results) {
						if (error) throw error;
						console.log(results);
						if (results.length == 0) {
							await interaction.editReply('Il n\'y a pas de question à vérifier.');
						} else {
							let em = new EmbedBuilder()
								.setTitle('Questions à vérifier')
								.setDescription('Voici les questions à vérifier.')
								.setColor("Blurple");
							for (let i = 0; i < results.length; i++) {
								em.addFields({ name: 'ID : ' + results[i].id, value: 'Question : ' + results[i].question + "\n\nRéponse :  ||" + ((results[0].answer) ? "Vrai" : "Faux") + "||" });
							}
							await interaction.editReply({ embeds: [em] });
						}
					});
				} else if (interaction.options.getSubcommand() === 'number') {
					const id = interaction.options.getString('id');
					connection.query('SELECT * FROM questions WHERE id =' + id, async function (error, results) {
						if (error) throw error;
						console.log(results);
						if (results.length == 0) {
							await interaction.editReply({content: 'Cette question potentielle n\'existe pas.'});
						} else if (results[0].verified == 1) {
							await interaction.editReply({content:'Cette question a déjà été vérifiée.'});
						} else {
							const refuser = new ButtonBuilder()
								.setCustomId('refuser')
								.setLabel('Refuser')
								.setStyle(ButtonStyle.Danger);
							const accepter = new ButtonBuilder()
								.setCustomId('accepter')
								.setLabel('Accepter')
								.setStyle(ButtonStyle.Success);
							let em = new EmbedBuilder()
								.setTitle('question à vérifier')
								.setDescription('Voici la question à vérifier.')
								.setColor("Blurple")
							em.addFields({ name: 'ID : ' + results[0].id, value: 'Question : ' + results[0].question + "\n\nRéponse : ||" + ((results[0].answer) ? "Vrai" : "Faux") + "||" });
							const row = new ActionRowBuilder().addComponents(refuser, accepter);
							const response = await interaction.editReply({ embeds: [em], components: [row] });
							const collectorFilter = i => i.user.id === interaction.user.id;
							try {
								const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000, max:1 });
								if (confirmation.customId === 'accepter') {
									connection.query('UPDATE questions SET verified = ?, valid = ? WHERE user_id = ? AND id = ?', [1, 1, results[0].user_id, results[0].id], async function (error, rezz) {
										if (error) throw error;
										console.log(rezz);
										connection.query('INSERT INTO points (user_id, points, reason) VALUES (?, ?, ?)', [results[0].user_id, 0.2, "Question acceptée"], async function (error, ea) {
											if (error) throw error;
											console.log(ea);
										});
										connection.query('SELECT * FROM important WHERE name = "channel"', async function (error, hehe) {
											if (error) throw error;
											console.log(hehe);
											if (hehe.length > 0) {
												await interaction.client.channels.cache.get(hehe[0].value).send({content:'<@' + results[0].user_id + '>, votre question a été validée. Vous avez gagné 0.2 points !'});
												await interaction.editReply({content: "La réponse a été envoyée dans le salon correspondant."});
											} else {
												await interaction.editReply('Votre question a été validée. Vous avez gagné 0.2 points !');
											}
										})
									})
								} else if (confirmation.customId === 'refuser') {
									connection.query('SELECT * FROM questions WHERE verified = 0 AND id =' + results[0].id, async function (error, results) {
										if (error) throw error;
										console.log(results);
										if (results.length == 0) {
											await interaction.editReply({content:'Cette question potentielle n\'existe pas.'});
										} else {
											connection.query('UPDATE questions SET verified = ?, valid = ? WHERE user_id = ? AND id = ?', [true, 0, results[0].user_id, results[0].id], async function (error, era) {
												if (error) throw error;
												console.log(era);
												connection.query('SHOW WARNINGS', function (error, rs) {
													if (error) throw error;
													console.log(rs);
												});
												connection.query('SELECT * FROM important WHERE name = "channel"', async function (error, result) {
													if (error) throw error;
													console.log(result);
													if (result.length > 0) {
														await interaction.client.channels.cache.get(result[0].value).send({content:'<@' + results[0].user_id + '>, votre question n\'a pas été validée. Vous n\'avez donc pas gagné de point.  '});
														await interaction.editReply({content:'La réponse a été envoyée dans le salon correspondant.'})
													} else {
														await interaction.editReply({content:'Votre question n\'a pas été validée. Vous n\'avez donc pas gagné de point. '});
													}
												})
											});
										}
									})
								}
							} catch (e) {
								console.log(e);
								await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
							}
						}
					});
				}
			}
			pool.releaseConnection(connection);
		});
	}
}