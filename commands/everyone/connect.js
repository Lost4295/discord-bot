const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { PASS, USER } = require('../../config.json');

module.exports = {
	cooldown: '50000',
	data: new SlashCommandBuilder()
		.setName('connect')
		.setDescription('Notifier sa présence.')
		.addAttachmentOption(option =>
			option
				.setName('image')
				.setDescription('Une image qui certifie du jeu joué en distanciel.')),
	async execute(interaction) {
		const img = interaction.options.getAttachment('image');
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			host: '127.0.0.1',
			user: USER,
			password: PASS,
			database: 'bot'
		});
		connection.connect();
		connection.query("SELECT * FROM dates WHERE date > NOW() OR NOW() - date < 8*60*60*1000 ORDER BY date ASC LIMIT 1", async function (error, results, fields) {
			if (error) throw error;
			if (results.length == 0) {
				await interaction.reply('Aucun événement n\'est prévu pour le moment.');
			} else {
				var now = new Date();
				var date = new Date(results[0].date);
				var diff = now - date;
				console.log(diff, date, now, results[0].date);
				if (diff > 8 * 60 * 60 * 1000) {
					await interaction.reply('L\'événement est déjà passé.');
				} else {
					connection.query('SELECT * FROM users where user_id = ' + interaction.user.id, async function (error, results, fields) {
						if (error) throw error;
						console.log(results);
						if (results.length == 0) {
							await interaction.reply('Vous n\'êtes pas inscrit dans la base de données de Couch Bot.');
						} else {
							if (img != null) {
								connection.query('INSERT INTO images (user_id, image) VALUES (?, ?)', [interaction.user.id, img.url], async function (error, results, fields) {
									if (error) {
										console.log(error);
										await interaction.channel.send({ content: 'Il y a eu une erreur lors de l\'envoi de votre image. Merci de contacter l\'un des administrateurs.', ephemeral: true });
									} else {
										await interaction.channel.send({ content: 'Votre image a bien été envoyée !', ephemeral: true });
									}
								});
							}
							connection.query('SELECT * FROM questions where valid = 1 ORDER BY RAND() LIMIT 1', async function (error, results, fields) {
								if (error) throw error;
								console.log(results);
								let question = results[0].question;
								let target = interaction.user;
								// let modal = new ModalBuilder()
								// 	.setCustomId('question')
								// 	.setTitle('Question');
								// let questionInput = new TextInputBuilder()
								// 	.setCustomId('answerInput')
								// 	.setLabel(question)
								// 	.setPlaceholder('Réponse')
								// 	.setStyle(TextInputStyle.Paragraph);
								// let actionRow = new ActionRowBuilder().addComponents(questionInput);
								// modal.addComponents(actionRow);
								// await interaction.showModal(modal);

								const confirm = new ButtonBuilder()
									.setCustomId('true')
									.setLabel('Vrai')
									.setStyle(ButtonStyle.Success);

								const cancel = new ButtonBuilder()
									.setCustomId('false')
									.setLabel('Faux')
									.setStyle(ButtonStyle.Danger);
								const row = new ActionRowBuilder()
									.addComponents(cancel, confirm);

								const response = await interaction.reply({
									content: `<@${target.id}>,  ${question}`,
									components: [row],
								});
								const collectorFilter = i => i.user.id === interaction.user.id;

								try {
									const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
									let r;
									if (confirmation.customId === 'true') {
										r = 1;
									} else if (confirmation.customId === 'false') {
										r = 0;
									}
									if (r == results[0].answer) {
										await interaction.editReply({ content: 'Bonne réponse !' });
										await interaction.followUp({ content: '<@' + target.id + '>, tu as gagné 0.5 points !' });
										connection.query("UPDATE users SET points = points + 0.5 where user_id = " + target.id, async function (error, results, fields) {
											if (error) throw error;
										})
										connection.query('INSERT INTO points (user_id, points, reason) VALUES (?,?,?)', [target.id, 0.5, 'Bonne réponse'], async function (error, results, fields) {
											if (error) throw error;
										})
									} else {
										await interaction.editReply({ content: 'Mauvaise réponse !' });
										await interaction.followUp({ content: '<@' + target.id + '>, tu as gagné 0.2 points !' });
										connection.query("UPDATE users SET points = points + 0.2 where user_id = " + target.id, async function (error, results, fields) {
											if (error) throw error;
										})
										connection.query('INSERT INTO points (user_id, points, reason) VALUES (?,?,?)', [target.id, 0.2, 'Mauvaise réponse'], async function (error, results, fields) {
											if (error) throw error;
										})
									}
								} catch (e) {
									console.error(e);
									await interaction.editReply({ content: 'Confirmation non reçue dans l\'intervalle d\'1 minute, annulation', components: [] });
									await interaction.followUp({ content: '<@' + target.id + '>, tu as gagné 0.1 points !' });
									connection.query("UPDATE users SET points = points + 0.1 where user_id = " + target.id, async function (error, results, fields) {
										if (error) throw error;
									})
									connection.query('INSERT INTO points (user_id, points, reason) VALUES (?,?,?)', [target.id, 0.1, 'Pas de réponse'], async function (error, results, fields) {
										if (error) throw error;
									})
								}
							});
						}
					});
				}
			}
		});

	}
};