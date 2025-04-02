const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getpts')
		.setDescription('Pour voir les points obtenus.')
		.addStringOption(option => option.setName('semestre').setDescription("Quel Semestre vous aimeriez voir.").setChoices(
			{value:"1", name:"Semestre 1"},
			{value:"2", name:"Semestre 2"},
		).setRequired(true))
		.addUserOption(option => option.setName('user').setDescription('L\'utilisateur dont vous voulez voir les points.')),
	async execute(interaction) {
		const pool = require("../../db.js");
		pool.getConnection(async function (err, connection) {
			const user = interaction.options.getUser('user') ?? interaction.user;
			const semestre = interaction.options.getString('semestre');
			let exampleEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setThumbnail(user.avatarURL())
				.setTimestamp()
				.setFooter({ text: 'Couch Bot' });
			const member = interaction.guild.members.cache.get(interaction.user.id);
			await interaction.deferReply();
			let query;
			console.log(semestre);
			if (semestre =="1"){
				query = 'SELECT pseudo, points, visibility, is_admin FROM users where user_id =';
			} else if (semestre =="2"){
				query = 'SELECT pseudo, points_s2, visibility, is_admin FROM users where user_id =';
			}
			connection.query(query + user.id, async function (error, results) {
				if (error) throw error;
				console.log(results);
				if (results.length == 0) {
					await interaction.editReply({content: user.username + ' n\'est inscrit dans la base de données de Couch Bot. '});
				} else if (results[0].visibility == 0 && interaction.user.id != user.id && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					await interaction.editReply({content: user.username + ' a choisi de ne pas rendre ses points visibles.'});
				} else {
					let desc;
					if (interaction.user.id != user.id){
						desc = results[0].pseudo +' a';
					} else {
						desc = 'Vous avez';
					}
					desc += ' actuellement ' + (semestre==2? results[0].points_s2:results[0].points) + ' points.';
					if (results[0].points >=4 && results[0].is_admin == 0){
						desc += " Votre note sera cependant limitée à 4 points.";
					} else if (results[0].points >= 6 && results[0].is_admin == 1){
						desc += " Votre note sera cependant limitée à 6 points.";
					}
					exampleEmbed.setTitle('Points obtenus par ' + results[0].pseudo);
					exampleEmbed.setDescription(desc);
					let query2;
					if (semestre =="1"){
						query2 ='SELECT * FROM points where user_id = '
					} else if (semestre =="2"){
						query2 ='SELECT * FROM points_s2 where user_id = '
					}
					connection.query(query2 + user.id, async function (error, results) {
						if (error) throw error;
						console.log(results);
						if (results.length == 0) {
							exampleEmbed.addFields({ name: 'Points', value: 'Vous n\'avez pas de points.', inline: true });
						} else {
							for (let i = 0; i < results.length; i++) {
								if (i <= 23) {
									if (results[i].points < 0) {
										exampleEmbed.addFields({ name: 'Perte de Points', value: results[i].points * -1 + " points perdus le " + results[i].date + " pour la raison suivante : " + results[i].reason, inline: true });
									} else {
										exampleEmbed.addFields({ name: 'Gain de Points', value: results[i].points + " points gagnés le " + results[i].date + " pour la raison suivante : " + results[i].reason, inline: true });
									}
								} else {
									exampleEmbed.addFields({ name: 'Autres', value: 'Les autres actions ne sont pas visibles. Pour en avoir un aperçu, veuillez exécuter la commande /allactions.', inline: true });
									break;
								}
							}
						}
						await interaction.editReply({ embeds: [exampleEmbed] });
					});
				}
			});
			pool.releaseConnection(connection);
		});

	}
};