const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { PASS, USER } = require('../../config.json');

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
								.setRequired(true))))
		.addSubcommand(group =>
			group
				.setName('validate')
				.setDescription('Valider une image.')

				.addStringOption(option =>
					option
						.setName('id')
						.setDescription('ID de l\'image.')
						.setRequired(true)))
		.addSubcommand(group =>
			group
				.setName('refuse')
				.setDescription('Refuser une image.')
				.addStringOption(option =>
					option
						.setName('id')
						.setDescription('ID de l\'image.')
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
				connection.query('SELECT * from images WHERE verified = 0', async function (error, results, fields) {
					if (error) throw error;
					console.log(results);
					let em = new EmbedBuilder()
						.setTitle('Images à vérifier')
						.setDescription('Voici les images à vérifier.')
						.setColor("Blurple");
					for (let i = 0; i < results.length; i++) {
						em.addFields({ name: 'ID : ' + results[i].id, value: 'Image : ' + results[i].image });
					}
					await interaction.reply({ embeds: [em] });
				});
			} else if (interaction.options.getSubcommand() === 'number') {
				const id = interaction.options.getString('id');
				connection.query('SELECT * FROM images WHERE id =' + id, async function (error, results, fields) {
					if (error) throw error;
					console.log(results);
					if (results.length == 0) {
						await interaction.reply('Cette image n\'existe pas.');
					} else {
						let em = new EmbedBuilder()
							.setTitle('Image à vérifier')
							.setDescription('Voici l\'image à vérifier.')
							.setColor("Blurple")
							.setImage(results[0].image);
						em.addFields({ name: 'ID : ' + results[0].id, value: 'Image : ' + results[0].image });
						await interaction.reply({ embeds: [em] });
					}
				});
			}
		}
		if (interaction.options.getSubcommand() === 'validate') {
			const id = interaction.options.getString('id');
			connection.query('SELECT * FROM images WHERE id =' + id, async function (error, results, fields) {
				if (error) throw error;
				if (results.length == 0) {
					await interaction.reply('Cette image n\'existe pas.');
				} else {
					connection.query('UPDATE images SET verified = ? AND ok = ? WHERE id = ?', [1, 1, id], async function (error, results, fields) {
						if (error) throw error;
						console.log("acliade", results, id);
						connection.query('UPDATE users SET points = points + 0.2 WHERE user_id = ?', [interaction.user.id], async function (error, results, fields) {
							if (error) throw error;
							console.log(results);
						});
						connection.query('INSERT INTO points (user_id, points, reason) VALUES (?, ?, ?)', [interaction.user.id, 0.2, "Image acceptée"], async function (error, results, fields) {
							if (error) throw error;
							console.log(results);
						});
						connection.query('SELECT * FROM important WHERE name = "channel"', async function (error, results, fields) {
							if (error) throw error;
							console.log(results);
							if (results.length > 0) {
								await interaction.client.channels.cache.get(results[0].value).send('<@' + interaction.user.id + '>, votre image a été validée. Vous avez gagné 0.2 points !');
							} else {
								await interaction.reply('Votre image a été validée. Vous avez gagné 0.2 points !');
							}
						})
					});
				}
			});
		}
		if (interaction.options.getSubcommand() === 'refuse') {
			const id = interaction.options.getString('id');
			connection.query('SELECT * FROM images WHERE id =' + id, async function (error, results, fields) {
				if (error) throw error;
				if (results.length == 0) {
					await interaction.reply('Cette image n\'existe pas.');
				} else {
					connection.query('UPDATE images SET verified = ? AND ok = ? WHERE id = ?', [1, 0, id], async function (error, results, fields) {
						if (error) throw error;
						console.log(results);
						connection.query('SELECT * FROM important WHERE name = "channel"', async function (error, results, fields) {
							if (error) throw error;
							console.log(results);
							if (results.length > 0) {
								await interaction.client.channels.cache.get(results[0].value).send('<@' + interaction.user.id + '>, votre image n\'a pas été validée. Vous n\'avez donc pas gagné de point.  ');
							} else {
								await interaction.reply('Votre image n\'a pas été validée. Vous n\'avez donc pas gagné de point. ');
							}
						})
					});
				}
			})
		}
		
	}
};