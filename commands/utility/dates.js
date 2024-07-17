const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { PASS, USER } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dates')
		.setDescription('Donne la liste des prochains événements.')
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
		connection.query('SELECT * from dates WHERE date > NOW()', async function (error, resultats, fields) {
			if (error) throw error;
			console.log(resultats);
			let embed = new EmbedBuilder()
				.setTitle('Dates')
				.setDescription('Voici les prochaines dates enregistrées par Couch Bot.')
				.setColor('#0099ff');
			if (resultats.length == 0) {
				embed.addFields({ name: 'Aucune date', value: 'Aucune date n\'a encore été enregistrée.' });
			} else {
				for (let i = 0; i < resultats.length; i++) {
					embed.addFields(
						{ name: ` #${i + 1} ${resultats[i].title}`, value: `Description : ${resultats[i].description}`, inline: true },
						{ name: `Date :`, value: resultats[i].date +" "+ `<t:${Date.parse(resultats[i].date)/1000}:R>`, inline: true },
						{ name: 'Distanciel ?', value: (resultats[i].distanciel) ? '✅' : '❌', inline: true }
					);
				}
			}
			await interaction.reply({ embeds: [embed] });
		});
	},
};