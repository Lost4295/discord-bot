const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { PASS, USER } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Donne la liste des meilleurs joueurs.')
		.setDMPermission(false),
	async execute(interaction) {

		var mysql = require('mysql');
		var connection = mysql.createConnection({
			host: '127.0.0.1',
			user: USER,
			password: PASS,
			database: 'bot'
		});
		connection.connect();
		connection.query('SELECT * from users WHERE points > 0 AND visibility=1 ORDER BY points DESC', async function (error, resultats, fields) {
			if (error) throw error;
			console.log(resultats);
			let embed = new EmbedBuilder()
				.setTitle('Leaderboard')
				.setDescription('Voici les meilleurs joueurs publics de Couch Bot.')
				.setColor('#0099ff');
			let len = resultats.length > 5 ? 5 : resultats.length;
			if (len == 0) {
				embed.addFields({ name: 'Pas de joueur', value: 'Aucun joueur n\'a encore de points et les a rendu publics.' });
			}
			for (let i = 0; i < len; i++) {
				embed.addFields({ name: ` #${i + 1} ${resultats[i].pseudo}`, value: `Points : ${resultats[i].points}` });
			}
			embed.addFields(
				{ name: '\u200B', value: '\u200B' },
			);
			connection.query('SELECT * from users WHERE user_id = ' + interaction.user.id, async function (error, results, fields) {
				if (error) throw error;
				connection.query('SELECT * from users WHERE points > 0 ORDER BY points DESC', async function (error, aa, fields) {
					if (error) throw error;
					let position = 0;
					for (let i = 0; i < aa.length; i++) {
						if (aa[i].user_id == interaction.user.id) {
							position = i + 1;
							break;
						}
					}
					if (results.length == 0) {
						embed.addFields({ name: 'Votre position', value: 'Vous n\'êtes pas inscrit dans la base de données de Couch Bot.' })
					} else {
						embed.addFields({ name: `Votre position`, value: position + "", inline: true }, { name: `Vos points`, value: results[0].points + "", inline: true })
					}
					await interaction.reply({ embeds: [embed] });
				});
			});
		});
        
	},
};