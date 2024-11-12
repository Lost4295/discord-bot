const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('checkimages')
		.setDescription('Vérifie les images.')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommandGroup(group =>
			group
				.setName('see')
				.setDescription('Gérer les images')
				.addSubcommand(option =>
					option
						.setName('all')
						.setDescription('Voir toutes les images.'))
				.addSubcommand(option =>
					option
						.setName('number')
						.setDescription('Voir une image.')
						.addStringOption(option =>
							option
								.setName('id')
								.setDescription('ID de l\'image.')
								.setRequired(true)))),
	async execute(interaction) {
		const pool = require("../../db.js");
		pool.getConnection(async function (err, connection) {
			await interaction.deferReply();
			if (interaction.options.getSubcommandGroup() === 'see') {
				if (interaction.options.getSubcommand() === 'all') {
					connection.query('SELECT * from images WHERE verified = 0', async function (error, results) {
						if (error) throw error;
						console.log(results);
						if (results.length == 0) {
							await interaction.editReply('Il n\'y a pas d\'image à vérifier.');
						} else {
							let em = new EmbedBuilder()
							.setTitle('Images à vérifier')
							.setDescription('Voici les images à vérifier.')
							.setColor("Blurple");
							for (let i = 0; i < results.length; i++) {
								em.addFields({ name: 'ID : ' + results[i].id, value: 'Image : ' + results[i].image });
							}
							await interaction.editReply({ embeds: [em] });
						}
					});
				} else if (interaction.options.getSubcommand() === 'number') {
					const id = interaction.options.getString('id');
					connection.query('SELECT * FROM images WHERE id =' + id, async function (error, results) {
						if (error) throw error;
						console.log(results);
						if (results.length == 0) {
							await interaction.editReply('Cette image n\'existe pas.');
						} else if (results[0].verified == 1) {
							await interaction.editReply('Cette image a déjà été vérifiée.');
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
								.setTitle('Image à vérifier')
								.setDescription('Voici l\'image à vérifier.')
								.setColor("Blurple")
								.setImage(results[0].image);
							em.addFields({ name: 'ID : ' + results[0].id, value: 'Image : ' + results[0].image });
							const row = new ActionRowBuilder().addComponents(refuser, accepter);
							const response = await interaction.editReply({ embeds: [em], components: [row] });
							const collectorFilter = i => i.user.id === interaction.user.id;
							const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000,max:1 });
							try {
								if (confirmation.customId === 'accepter') {
									connection.query('UPDATE images SET verified = ?, ok = ? WHERE id = ?', [1, 1, results[0].id], async function (error) {
										if (error) throw error;
										connection.query('UPDATE users SET points = points + 0.25 WHERE user_id = ?', [results[0].user_id], async function (error) {
											if (error) throw error;
										});
										connection.query('INSERT INTO points (user_id, points, reason) VALUES (?, ?, ?)', [results[0].user_id, 0.25, "Image acceptée"], async function (error) {
											if (error) throw error;
										});
										await confirmation.update('L\'image a bien été validée.');
										connection.query('SELECT * FROM important WHERE name = "channel"', async function (error, resultsa) {
											if (error) throw error;
											console.log(resultsa);
											if (resultsa.length > 0) {
												const channel = interaction.client.channels.cache.get(resultsa[0].value);
												if (channel) {
													await channel.send('<@' + results[0].user_id + '>, votre image a été validée. Vous avez gagné 0.25 points !');
												} else {
													await interaction.followUp('Votre image a été validée. Vous avez gagné 0.25 points !');
												}
											} else {
												await interaction.editReply('Votre image a été validée. Vous avez gagné 0.25 points !');
											}
										})
									});
								} else if (confirmation.customId === 'refuser') {
									await confirmation.update({ content: 'Pas de point accordé', components: [] });
									connection.query('SELECT * FROM images WHERE verified = 0 AND id =' + results[0].id, async function (error, results) {
										if (error) throw error;
										if (results.length == 0) {
											await interaction.editReply('Cette image n\'existe pas.');
										} else {
											connection.query('UPDATE images SET verified = ?, ok = ? WHERE id = ?', [1, 0, id], async function (error, resultse) {
												if (error) throw error;
												console.log(resultse);
												connection.query('SELECT * FROM important WHERE name = "channel"', async function (error, resultsa) {
													if (error) throw error;
													console.log(resultsa);
													if (resultsa.length > 0) {
														await interaction.client.channels.cache.get(resultsa[0].value).send('<@' + results[0].user_id + '>, votre image n\'a pas été validée. Vous n\'avez donc pas gagné de point.  ');
													} else {
														await interaction.editReply('Votre image n\'a pas été validée. Vous n\'avez donc pas gagné de point. ');
													}
												})
											});
										}
									})
								}
							} catch (e) {
								console.log(e);
								await confirmation.update({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
							}
						}
					});
				}
			}
			pool.releaseConnection(connection);
		});
	}
};