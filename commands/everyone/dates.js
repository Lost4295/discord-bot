const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dates')
		.setDescription('Donne la liste des prochains événements.')
		.setDMPermission(false),
	async execute(interaction) {
		const pool = require("../../db.js");
		pool.getConnection(async function (err, connection) {
			await interaction.deferReply();
			connection.query('SELECT * from dates WHERE date > NOW()', async function (error, resultats) {
				if (error) throw error
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
							{ name: ` #${i + 1} ${resultats[i].title} ${interaction.member.roles.cache.some(role => role.name === 'Admin')?"(ID :"+resultats[i].id+")":""}`, value: `Description : ${resultats[i].description}`, inline: true },
							{ name: `Date :`, value: resultats[i].date + " " + `<t:${Date.parse(resultats[i].date) / 1000}:R>`, inline: true },
							{ name: 'Distanciel ?', value: (resultats[i].distanciel) ? '✅' : '❌', inline: true }
						);
					}
				}
				await interaction.editReply({ embeds: [embed] });
			});
			pool.releaseConnection(connection);
		});
	},
};