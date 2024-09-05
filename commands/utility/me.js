const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PASS, USER } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('me')
		.setDescription('Vous donne des infomations sur vous.'),
	async execute(interaction) {
		var mysql = require('mysql2');
		var connection = mysql.createConnection({
			host: '127.0.0.1',
			user: USER,
			password: PASS,
			database: 'bot'
		});
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
		connection.connect();
		connection.query('SELECT * FROM users where user_id = '+ interaction.user.id, async function (error, results, fields) {
			if (error) throw error;
			console.log(results);
			if (results.length == 0) {
				await interaction.reply('Vous n\'êtes pas inscrit dans la base de données de Couch Bot. ');
			} else {
				exampleEmbed.addFields(
					// { name: 'Regular field title', value: 'Some value here' },
					// { name: '\u200B', value: '\u200B' },
					{ name: 'Pseudo', value: results[0].pseudo },
					{ name: 'Nom', value: results[0].nom },
					{ name: 'Prénom', value: results[0].prenom },
					{ name: 'Classe', value: results[0].classe }
				)
				await interaction.reply({ embeds: [exampleEmbed] });
				// await interaction.reply('Bonjour ' + results[0].nom + ' ' + results[0].prenom);
			}
		});
        
	},
};