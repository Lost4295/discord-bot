const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Répond avec Pong!'),
	async execute(interaction) {
		const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
		interaction.editReply({content:`Roundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`});
	},
};