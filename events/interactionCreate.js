const { Events, Collection } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		const channelId = interaction.channel.isThread() ? interaction.channel.parentId : interaction.channel.id;
		if (channelId === '1283837518848196721' || channelId === "772516231952990208" || interaction.member.roles.cache.some(role => role.name === 'Admin')) {
			const pool = require("../db.js");
			pool.getConnection(async function (error, connection) {
				if (error) {
					if (error.code == "PROTOCOL_CONNECTION_LOST") {
						interaction.client.channels.cache.get(interaction.channel.id).send("La connexion à la base de données a été perdue. Veuillez contacter un administrateur.");
					}
					if (error.code == "ECONNREFUSED") {
						interaction.client.channels.cache.get(interaction.channel.id).send("La connexion à la base de données a été refusée. Veuillez contacter un administrateur.");
					}
				}
				if (interaction.channel.id ==='772516231952990208' && interaction.commandName !== 'connect' && interaction.commandName !== "emergencyconnect" && !interaction.member.roles.cache.some(role => role.name === 'Admin')) {
					await interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande ici.', flags: MessageFlags.Ephemeral });
					return;
				}
				connection.query('SELECT * FROM important WHERE name = "channel"', async function (error, results) {
					if (error) throw error;
					if (results.length == 0) {
						await interaction.client.channels.cache.get(interaction.channel.id).send("Attention, vous n'avez **PAS** défini de salon où envoyer les messages. Lancez la commande **__/setup__**, ou demandez à un administrateur de le faire ! ")
					}
				})
				if (interaction.isModalSubmit()) {
					if (interaction.customId === 'inscription') {
						const firstname = interaction.fields.getTextInputValue('firstname')
						const lastname = interaction.fields.getTextInputValue('lastname')
						const classe = interaction.fields.getTextInputValue('classe')
						console.log({ firstname, lastname, classe });
						connection.query(
							'INSERT INTO users (pseudo, id, prenom, nom, classe, date_inscr) VALUES (?, ?, ?, ?, ?, NOW())',
							[interaction.user.username, interaction.user.id, firstname, lastname, classe],
							async function (error) {
								if (error) { 
									console.log(error);
									if (error.code === 'ER_DUP_ENTRY') {
										await interaction.reply({ content: 'Vous êtes déjà inscrit. Si vous voulez modifier vos informations, veuillez exécuter la commande /settings.', flags: MessageFlags.Ephemeral });
									} else {
										await interaction.reply({ content: 'Il y a eu une erreur lors de l\'inscription. Merci de contacter l\'un des administrateurs.', flags: MessageFlags.Ephemeral });
									}
								} else {
									await interaction.reply({ content: 'Vous avez bien été inscrit !', flags: MessageFlags.Ephemeral });
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
				} else if (interaction.isButton()) {
					console.log("test");
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
							return interaction.reply({ content: `Veuillez patienter, vous devez attendre avant de relancer \`${command.data.name}\`. Vous pouvez l'utiliser à nouveau <t:${expiredTimestamp}:R>.`, flags: MessageFlags.Ephemeral });
						}
					}
					timestamps.set(interaction.user.id, now);
					setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
					try {
						console.log(
							`/${interaction.commandName} — Par ${interaction.user.username}`)
							// if (interaction.commandName !== "emergencyconnect"){
							// 	await interaction.reply({ content: 'Le bot a un problème ! Vous ne pouvez pas utiliser cette commande pour le moment. ', flags: MessageFlags.Ephemeral });
							// 	return;
							// }
						connection.query('SELECT user_id FROM blocked_users', async function (error, results) {
							if (error) throw error;
							for (let result of results) {
								console.log(result.user_id, interaction.user.id, result.user_id == interaction.user.id);
								if (result.user_id == interaction.user.id) {
									await interaction.reply({ content: 'Vous êtes bloqué.', flags: MessageFlags.Ephemeral });
									return;
								}
							}
							console.log(interaction);
							pool.releaseConnection(connection);
							await command.execute(interaction);
						});
					} catch (error) {
						console.error(error);
						if (error.code=== 50109 ){
							throw new Error("Random error, needs to restart...");
						}
						if (interaction.replied || interaction.deferred) {
							await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
						} else {
							await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
						}
						pool.releaseConnection(connection);
					}
				}
			});
		} else {
			await interaction.reply({ content: 'Vous ne pouvez pas utiliser cette commande dans ce salon.', flags: MessageFlags.Ephemeral });
		}
	}
}
