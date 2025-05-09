const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('me')
		.setDescription('Vous donne des infomations sur vous.'),
	async execute(interaction) {
		const pool = require("../../db.js");
		let exampleEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('À propos de vous')
			// .setURL('https://discord.js.org/')
			// .setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
			// .setDescription('Some description here')
			.setThumbnail(interaction.user.avatarURL())
			// .addFields(
			// { name: 'Regular field title', value: 'Some value here' },
			// { name: '\u200B', value: '\u200B' },
			// 	{ name: 'Pseudo', value: results[0].pseudo, inline: true },
			// 	{ name: 'Nom', value: results[0].nom, inline: true },
			// 	{ name: 'Prénom', value: results[0].prénom, inline: true },
			// 	{ name: 'classe', value: results[0].classe, inline: true },
			// )
			// .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
			// .setImage('https://i.imgur.com/AfFp7pu.png')
			.setTimestamp()
			.setFooter({ text: 'Couch Bot - Pour modifier vos informations, lancer /settings' });
		// .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
		pool.getConnection(async function (err, connection) {
			await interaction.deferReply();
			connection.query('SELECT * FROM users where user_id = ' + interaction.user.id, async function (error, results) {
				if (error) throw error;
				console.log(results);
				if (results.length == 0) {
					await interaction.editReply({content:'Vous n\'êtes pas inscrit dans la base de données de Couch Bot. '});
				} else {
					exampleEmbed.addFields(
						// { name: 'Regular field title', value: 'Some value here' },
						// { name: '\u200B', value: '\u200B' },
						{ name: 'Pseudo', value: results[0].pseudo },
						{ name: 'Nom', value: results[0].nom },
						{ name: 'Prénom', value: results[0].prenom },
						{ name: 'Classe', value: results[0].classe },
						{ name: 'Points du semestre 1', value: results[0].points + ' points' },
						{ name: 'Points du semestre 2', value: results[0].points_s2 + ' points' },
						{ name: 'Points de Quizz', value: results[0].quizzpoints + ' points' },
					)
					await interaction.editReply({ embeds: [exampleEmbed] });
					// await interaction.reply('Bonjour ' + results[0].nom + ' ' + results[0].prenom);
				}
			});
			pool.releaseConnection(connection);
		});
	},
};