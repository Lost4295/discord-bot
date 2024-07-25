const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { PASS, USER } = require('../../config.json');

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
		.addSubcommand(group =>
			group
				.setName('validate')
				.setDescription('Valider une question.')

				.addStringOption(option =>
					option
						.setName('id')
						.setDescription('ID de la question.')
						.setRequired(true)))
		.addSubcommand(group =>
			group
				.setName('refuse')
				.setDescription('Refuser une question.')
				.addStringOption(option =>
					option
						.setName('id')
						.setDescription('ID de la question.')
						.setRequired(true)))
	,
	async execute(interaction) {
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			host: '127.0.0.1',
			user: USER,
			password: PASS,
			database: 'bot'
		});
		connection.connect();
		if (interaction.options.getSubcommandGroup() === 'see') {
			if (interaction.options.getSubcommand() === 'all') {
				connection.query('SELECT * from questions WHERE verified = 0', async function (error, results, fields) {
					if (error) throw error;
					console.log(results);
					let em = new EmbedBuilder()
						.setTitle('Questions à vérifier')
						.setDescription('Voici les questions à vérifier.')
						.setColor("Blurple");
					for (let i = 0; i < results.length; i++) {
						em.addFields({ name: 'ID : ' + results[i].id, value: 'Question : ' + results[i].question + "\n\nRéponse :  ||" + ((results[0].answer) ? "Vrai" : "Faux") + "||" });
					}
					await interaction.reply({ embeds: [em] });
				});
			} else if (interaction.options.getSubcommand() === 'number') {
				const id = interaction.options.getString('id');
				connection.query('SELECT * FROM questions WHERE id =' + id, async function (error, results, fields) {
					if (error) throw error;
					console.log(results);
					if (results.length == 0) {
						await interaction.reply('Cette question potentielle n\'existe pas.');
					} else {
						let em = new EmbedBuilder()
							.setTitle('question à vérifier')
							.setDescription('Voici la question à vérifier.')
							.setColor("Blurple")
						em.addFields({ name: 'ID : ' + results[0].id, value: 'Question : ' + results[0].question + "\n\nRéponse : ||" + ((results[0].answer) ? "Vrai" : "Faux") + "||" });
						await interaction.reply({ embeds: [em] });
					}
				});
			}
		}
		if (interaction.options.getSubcommand() === 'validate') {
			const id = interaction.options.getString('id');
			connection.query('SELECT * FROM questions WHERE verified = 0 AND id =' + id, async function (error, results, fields) {
				if (error) throw error;
				console.log(results);
				if (results.length == 0) {
					await interaction.reply('Cette question potentielle n\'existe pas.');
				} else {
					connection.query('UPDATE questions SET verified = ?, valid = ? WHERE user_id = ? AND id = ?', [1, 1, results[0].user_id, id], async function (error, rezz, fields) {
						if (error) throw error;
						console.log(rezz);
						connection.query('UPDATE users SET points = points + 0.2 WHERE user_id = ?', [results[0].user_id], async function (error, re, fields) {
							if (error) throw error;
							console.log(re);
						});
						connection.query('INSERT INTO points (user_id, points, reason) VALUES (?, ?, ?)', [results[0].user_id, 0.2, "Question acceptée"], async function (error, ea, fields) {
							if (error) throw error;
							console.log(ea);
						});
						connection.query('SELECT * FROM important WHERE name = "channel"', async function (error, hehe, fields) {
							if (error) throw error;
							console.log(hehe);
							if (hehe.length > 0) {
								await interaction.client.channels.cache.get(hehe[0].value).send('<@' + results[0].user_id + '>, votre question a été validée. Vous avez gagné 0.2 points !');
								await interaction.reply('La réponse a été envoyée dans le salon correspondant.')
							} else {
								await interaction.reply('Votre question a été validée. Vous avez gagné 0.2 points !');
							}
						})
					})
				};
			});
		}
		if (interaction.options.getSubcommand() === 'refuse') {
			const id = interaction.options.getString('id');
			connection.query('SELECT * FROM questions WHERE verified = 0 AND id =' + id, async function (error, results, fields) {
				if (error) throw error;
				console.log(results);
				if (results.length == 0) {
					await interaction.reply('Cette question potentielle n\'existe pas.');
				} else {
					connection.query('UPDATE questions SET verified = ?, valid = ? WHERE user_id = ? AND id = ?', [true, 0, results[0].user_id, id], async function (error, era, fields) {
						if (error) throw error;
						console.log(era);
						connection.query('SHOW WARNINGS', function (error, rs, fields) {
							if (error) throw error;
							console.log(rs);
						});
						connection.query('SELECT * FROM important WHERE name = "channel"', async function (error, result, fields) {
							if (error) throw error;
							console.log(result);
							if (result.length > 0) {
								await interaction.client.channels.cache.get(result[0].value).send('<@' + results[0].user_id + '>, votre question n\'a pas été validée. Vous n\'avez donc pas gagné de point.  ');
								await interaction.reply('La réponse a été envoyée dans le salon correspondant.')
							} else {
								await interaction.reply('Votre question n\'a pas été validée. Vous n\'avez donc pas gagné de point. ');
							}
						})
					});
				}
			});
		}
	}
}