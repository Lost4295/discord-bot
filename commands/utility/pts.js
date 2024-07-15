const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PASS, USER } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getpts')
		.setDescription('Pour voir les points obtenus.'),
	async execute(interaction) {
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			host: '127.0.0.1',
			user: USER,
			password: PASS,
			database: 'bot'
		});
		let exampleEmbed = new EmbedBuilder()
		.setColor(0x0099FF)
		// .setTitle('À propos de vous')
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
		.setFooter({ text: 'Couch Bot' });
	// .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
		connection.connect();
		connection.query('SELECT pseudo, points FROM users where user_id = '+ interaction.user.id, async function (error, results, fields) {
			if (error) throw error;
			console.log(results);
			if (results.length == 0) {
				await interaction.reply('Vous n\'êtes pas inscrit dans la base de données de Couch Bot. ');
			} else {
				exampleEmbed.setTitle('Points obtenus par ' + results[0].pseudo);
				exampleEmbed.setDescription('Vous avez actuellement ' + results[0].points + ' points.');
				
				// await interaction.reply('Bonjour ' + results[0].nom + ' ' + results[0].prenom);
				connection.query('SELECT pseudo, points FROM users where user_id = '+ interaction.user.id, async function (error, results, fields) {
					if (error) throw error;
					console.log(results);
					if (results.length == 0) {
						await interaction.reply('Vous n\'êtes pas inscrit dans la base de données de Couch Bot. ');
					} else {
						exampleEmbed.setTitle('Points obtenus par ' + results[0].pseudo);
				exampleEmbed.setDescription('Vous avez actuellement ' + results[0].points + ' points.');
				await interaction.reply({ embeds: [exampleEmbed] });
				// await interaction.reply('Bonjour ' + results[0].nom + ' ' + results[0].prenom);
			}
		});
		
	}
});
	},
};