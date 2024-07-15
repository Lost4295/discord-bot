const { SlashCommandBuilder, ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle, } = require('discord.js');
const { PASS, USER } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('connect')
		.setDescription('Notifier sa présence.'),
	async execute(interaction) {
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			host: '127.0.0.1',
			user: USER,
			password: PASS,
			database: 'bot'
		});
		connection.connect();
		connection.query('SELECT * FROM users where user_id = ' + interaction.user.id, async function (error, results, fields) {
			if (error) throw error;
			console.log(results);
			if (results.length == 0) {
				await interaction.reply('Vous n\'êtes pas inscrit dans la base de données de Couch Bot.');
			} else {
				connection.query('SELECT * FROM question where valid = 1 ORDER BY RAND() LIMIT 1', async function (error, results, fields) {
					if (error) throw error;
					console.log(results);
					let modal = new ModalBuilder()
						.setCustomId('question')
						.setTitle('Question');
					let question = results[0].question;
					let questionInput = new TextInputBuilder()
						.setCustomId('questionInput')
						.setLabel(question)
						.setStyle(TextInputStyle.Paragraph);
					let actionRow = new ActionRowBuilder().addComponents(questionInput);
					modal.addComponents(actionRow);
					await interaction.showModal(modal);
				});
			}
		});
	}
};