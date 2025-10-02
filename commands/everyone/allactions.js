//TODO : refaire
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('allactions')
		.setDescription('Pour voir les points obtenus.')
		.addUserOption(option => option.setName('user').setDescription('L\'utilisateur dont vous voulez voir les points.'))
		.addStringOption(option => option.setName('semestre').setDescription("Quel semestre vous aimeriez voir.").setChoices(
			{value:"1", name:"Semestre 1"},
			{value:"2", name:"Semestre 2"},
		))
		.addBooleanOption(option => option.setName('quizz').setDescription('Voir les points gagnés au quizz.')),
	async execute(interaction) {
		const pool = require("../../db.js");
		const user = interaction.options.getUser('user') ?? interaction.user;
		const quizz = interaction.options.getBoolean('quizz') ?? false;
		const semestre = interaction.options.getString('semestre') ?? "1";
		let message = '';

		await interaction.reply("Cette commande ne fonctionne pas pour l'instant, mais elle le sera très vite ! Demandez à <@349983254373466114> pour avoir la réponse à votre demande.");
		return;
		pool.getConnection(async function (err, connection) {
			await interaction.deferReply();
			if (quizz) {
				connection.query('SELECT pseudo, quizzpoints FROM users where discord_id = ' + user.id, async function (error, results) {
					if (error) throw error;
					console.log(results);
					let member = interaction.guild.members.cache.get(interaction.user.id);
					if (results.length == 0) {
						await interaction.editReply({content:'Vous n\'êtes pas inscrit dans la base de données de Couch Bot. '});
					} else if (results[0].visibility == 0 && interaction.user.id != user.id && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
						await interaction.editReply({content:user.username + ' a choisi de ne pas rendre ses points visibles.'});
					} else {
						message += 'Points obtenus par ' + results[0].pseudo + '\n';
						message += 'Vous avez actuellement ' + results[0].quizzpoints + ' points. \n\n';
						connection.query('SELECT * FROM quizzpoints where user_id = ' + user.id, async function (error, results) {
							if (error) throw error;
							console.log(results);
							if (results.length != 0) {
								for (let result of results) {
									message += '## Gain de Points\n' + result.quizzpoints + " points gagnés le " + result.date + '\n';
								}
							}
							if (message.length > 2000) {
								await interaction.editReply({content:'Le message est trop long pour être envoyé en une seule fois. Veuillez consulter votre messagerie privée.'});
								while (message.length > 0) {
									await interaction.user.send({content:message.slice(0, 2000)});
									message = message.slice(2000);
								}
							} else {
								await interaction.editReply({content:message});
							}
						});
					}
				});
			} else {
				let query;
				let ss2 = false;
				if (semestre =="1"){
					query = 'SELECT pseudo, points FROM users where discord_id = '
				} else if (semestre =="2"){
					query = 'SELECT pseudo, points FROM users where discord_id = '
					ss2 = true;
				}
				connection.query(query + user.id, async function (error, results) {
					if (error) throw error;
					console.log(results);
					let member = interaction.guild.members.cache.get(interaction.user.id);
					if (results.length == 0) {
						await interaction.editReply({content: 'Vous n\'êtes pas inscrit dans la base de données de Couch Bot. '});
					} else if (results[0].visibility == 0 && interaction.user.id != user.id && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
						await interaction.editReply({content: user.username + ' a choisi de ne pas rendre ses points visibles.'});
					} else {
						let points;
						let query2;
						if (ss2){	
							points = results[0].points
							query2 ='SELECT * FROM points where user_id = '
						} else {
							points = results[0].points
							query2 ='SELECT * FROM points where user_id = '
						}
						message += 'Points obtenus par ' + results[0].pseudo + '\n';
						message += 'Vous avez actuellement ' + points + ' points. \n\n';
						connection.query(query2 + user.id, async function (error, results) {
							if (error) throw error;
							console.log(results);
							if (results.length != 0) {
								for (const element of results) {
									if (element.points < 0) {
										message += '## Perte de Points\n' + element.points * -1 + " points perdus le " + element.date + " pour la raison suivante : " + element.reason + '\n';
									} else {
										message += '## Gain de Points\n' + element.points + " points gagnés le " + element.date + " pour la raison suivante : " + element.reason + '\n';
									}
								}
							}
							if (message.length > 2000) {
								await interaction.editReply({content: 'Le message est trop long pour être envoyé en une seule fois. Veuillez consulter votre messagerie privée.'});
								while (message.length > 0) {
									await interaction.user.send({content: message.slice(0, 2000)});
									message = message.slice(2000);
								}
							} else {
								await interaction.editReply({content: message});
							}
						});
					}
				});
			}
			pool.releaseConnection(connection);
		});
	}
};