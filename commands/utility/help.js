const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Liste toutes les commandes disponibles.'),
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
		let embed = new EmbedBuilder();
		embed.setTitle(`Commandes disponibles sur ${interaction.guild.name} :`);
		embed.setDescription('Voici la liste de toutes les commandes disponibles sur ce serveur.');
		embed.setColor('#0099ff');
		embed.setTimestamp();
		embed.setFooter({ text: 'Bot créé par kai_you' });
		let commands = interaction.client.commands;
		let commandsList = '';
		commands.forEach(command => {
			commandsList += `- **/${command.data.name}** - ${command.data.description}`;
			if (command.data.default_member_permissions) {
				switch (command.data.default_member_permissions) {
					case '8':
						commandsList += " (👨‍✈️)";
						break;
					case '2':
						commandsList += " (👩‍💻 +)";
						break;
					case '4':
						commandsList += " (👩‍💻 ban)";
						break;
					case '1099511627776':
						commandsList += " (👮‍♂️)";
						break;
				}
			}
			commandsList += "\n";
		});
		await interaction.reply({ content: commandsList, ephemeral: true });
	},
};