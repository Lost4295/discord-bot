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
						.setTitle('questions à vérifier')
						.setDescription('Voici les questions à vérifier.')
						.setColor("Blurple");
					for (let i = 0; i < results.length; i++) {
						em.addFields({ name: 'ID : ' + results[i].id, value: 'question : ' + results[i].question });
					}
					await interaction.reply({ embeds: [em] });
				});
			} else if (interaction.options.getSubcommand() === 'number') {
				const id = interaction.options.getString('id');
				connection.query('SELECT * FROM questions WHERE id =' + id, async function (error, results, fields) {
					if (error) throw error;
					console.log(results);
					let em = new EmbedBuilder()
						.setTitle('question à vérifier')
						.setDescription('Voici la question à vérifier.')
						.setColor("Blurple")
						.setquestion(results[0].question);
					em.addFields({ name: 'ID : ' + results[0].id, value: 'question : ' + results[0].question });

					await interaction.reply({ embeds: [em] });
				});
			}
		}
		if (interaction.options.getSubcommand() === 'validate') {
			const id = interaction.options.getString('id');
			connection.query('UPDATE questions SET verified = ? AND ok = ? WHERE user_id = ?', [id, 1, interaction.user.id], async function (error, results, fields) {
				if (error) throw error;
				console.log(results);
				connection.query('UPDATE users SET points = points + 0.2 WHERE user_id = ?', [interaction.user.id], async function (error, results, fields) {
					if (error) throw error;
					console.log(results);
				});
				connection.query('INSERT INTO points (user_id, points, reason) VALUES (?, ?, ?)', [interaction.user.id, 0.2, "question acceptée"], async function (error, results, fields) {
					if (error) throw error;
					console.log(results);
				});
				connection.query('SELECT * FROM important WHERE name = "channel"', async function (error, results, fields) {
					if (error) throw error;
					console.log(results);
					if (results.length > 0) {
						await interaction.client.channels.cache.get(results[0].value).send('<@' + interaction.user.id + '>, votre question a été validée. Vous avez gagné 0.2 points !');
					} else {
						await interaction.reply('Votre question a été validée. Vous avez gagné 0.2 points !');
					}
				})
			});
		}
		if (interaction.options.getSubcommand() === 'refuse') {
			const id = interaction.options.getString('id');
			connection.query('UPDATE questions SET verified = ? AND ok = ? WHERE user_id = ?', [id, 0, interaction.user.id], async function (error, results, fields) {
				if (error) throw error;
				console.log(results);
				connection.query('SELECT * FROM important WHERE name = "channel"', async function (error, results, fields) {
					if (error) throw error;
					console.log(results);
					if (results.length > 0) {
						await interaction.client.channels.cache.get(results[0].value).send('<@' + interaction.user.id + '>, votre question n\'a pas été validée. Vous n\'avez donc pas gagné de point.  ');
					} else {
						await interaction.reply('Votre question n\'a pas été validée. Vous n\'avez donc pas gagné de point. ');
					}
				})
			});

		}
	}
}