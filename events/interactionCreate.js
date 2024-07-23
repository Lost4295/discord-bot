const { Events, Collection } = require('discord.js');
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
		connection.query('SELECT * FROM important WHERE name = "channel"', async function (error, results, fields) {
			if (error) throw error;
			if (results.length == 0){
				await interaction.client.channels.cache.get(interaction.channel.id).send("Attention, vous n'avez **PAS** défini de salon où envoyer les messages. Lancez la commande **__/setup__**, ou demandez à un administrateur de le faire ! ")}
		})

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
								await interaction.reply({ content: 'Vous êtes déjà inscrit. Si vous voulez modifier vos informations, veuillez exécuter la commande /settings.', ephemeral: true });
							} else {
								await interaction.reply({ content: 'Il y a eu une erreur lors de l\'inscription. Merci de contacter l\'un des administrateurs.', ephemeral: true });
							}
						} else {
							await interaction.reply({ content: 'Vous avez bien été inscrit !', ephemeral: true });
						}
					});
			} else if (interaction.customId === 'question') {
				// console.log(interaction);
				// await interaction.reply({ content: 'Your submission was received successfully!' });
				// connection.query('SELECT * FROM question where valid = 1 ORDER BY RAND() LIMIT 1', async function (error, results, fields) {
				// 	if (error) throw error;
				// 	console.log(results);
				// 	results
				// });
				// await interaction.followUp({ content: 'Your d was received successfully!' });;
				// const a = interaction.fields.getTextInputValue('answerInput');
				// console.log({ favoriteColor });
			}
		} else {
			const { cooldowns } = interaction.client;
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}
			if (!cooldowns.has(command.data.name)) {
				cooldowns.set(command.data.name, new Collection());
			}

			const now = Date.now();
			const timestamps = cooldowns.get(command.data.name);
			const defaultCooldownDuration = 3;
			const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

			if (timestamps.has(interaction.user.id)) {
				const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

				if (now < expirationTime) {
					const expiredTimestamp = Math.round(expirationTime / 1_000);
					return interaction.reply({ content: `Veuillez patienter, vous devez attendre avant de relancer \`${command.data.name}\`. Vous pouvez l'utiliser à nouveau <t:${expiredTimestamp}:R>.`, ephemeral: true });
				}
			}
			timestamps.set(interaction.user.id, now);
			setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
			try {
				console.log(
					`/${interaction.commandName} — Par ${interaction.user.username}`)
					connection.query('SELECT user_id FROM blocked_users', async function (error, results, fields) {
						if (error) throw error;
						for (let i = 0; i < results.length; i++) {
							console.log(results[i].user_id, interaction.user.id, results[i].user_id == interaction.user.id);
							if (results[i].user_id == interaction.user.id) {
								await interaction.reply({ content: 'Vous êtes bloqué.', ephemeral: true });
								return;
							}
						}
						await command.execute(interaction);
					});
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