const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('classes')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription('DEV // Donne les élèves et leur classe')
		.setDMPermission(false),
	async execute(interaction) {
		const pool = require("../../db.js");
		pool.getConnection(async function (err, connection) {
			await interaction.deferReply();
			connection.query('SELECT * from users', async function (error, resultats) {
				if (error) throw error;
				console.log(resultats);
				let message = '';
				let len = resultats.length;
				if (len == 0) {
					message = 'pas d\'élève'
				} else {
					message += 'Élèves :\n';
					for (let i = 0; i < len; i++) {
						message += ` - ${resultats[i].nom} ${resultats[i].prenom} (${resultats[i].pseudo}) : ${resultats[i].classe}\n`;
					}
				}
				let messageLength = message.length;
				if (messageLength > 2000) {
					await interaction.editReply(message.slice(0, 2000));
					while (message.length > 0) {
						message = message.slice(2000);
						await interaction.followUp(message.slice(0, 2000));
					}
				} else {
					await interaction.editReply(message);
				}
			})
			pool.releaseConnection(connection);
		});
	}
};