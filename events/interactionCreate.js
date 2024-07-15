const { Events } = require('discord.js');
const { PASS, USER } = require('../config.json');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		// var n = 0;
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			host: '127.0.0.1',
			user: USER,
			password: PASS,
			database: 'bot'
		});
		connection.connect();
		// connection.query('SELECT user_id FROM blocked_users', async function (error, results, fields) {
		// 	if (error) throw error;
		// 	for (let i = 0; i < results.length; i++) {
		// 		console.log(results[i].user_id, interaction.user.id, results[i].user_id == interaction.user.id);
		// 		if (results[i].user_id == interaction.user.id) {
		// 			n = 1;
		// 			break;
		// 		}
		// 	}
		// });
		// console.log(n);
		// if (n == 1) {
		// 	return;
		// }
		if (interaction.isModalSubmit()) {
			if (interaction.customId === 'inscription') {
				const firstname = interaction.fields.getTextInputValue('firstname')
				const lastname = interaction.fields.getTextInputValue('lastname')
				const classe = interaction.fields.getTextInputValue('classe')
				console.log({ firstname, lastname, classe });
				connection.query(
					'INSERT INTO users (pseudo, user_id, prenom, nom, classe) VALUES (?, ?, ?, ?, ?)',
					[interaction.user.username, interaction.user.id, firstname, lastname, classe],
					async function (error, results, fields) {
						if (error) {
							if (error.code === 'ER_DUP_ENTRY') {
								await interaction.followUp({ content: 'Vous êtes déjà inscrit. Si vous voulez modifier vos informations, veuillez exécuter la commande /settings.', ephemeral: true });
							} else {
								await interaction.followUp({ content: 'Il y a eu une erreur lors de l\'inscription. Merci de contacter l\'un des administrateurs.', ephemeral: true });
							}
						} else {
							await interaction.reply({ content: 'Vous avez bien été inscrit !', ephemeral: true });
						}
					});
			} else if (interaction.customId === 'question') {
				await interaction.reply({ content: 'Your submission was received successfully!' });
				const favoriteColor = interaction.fields.getTextInputValue('answerInput');
				console.log({ favoriteColor });
			}
		} else {
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}
			try {
				console.log(
					`/${interaction.commandName} — Par ${interaction.user.username}`)
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		}
	},
};