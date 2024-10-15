const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Liste toutes les commandes disponibles.')
		.addBooleanOption(
			option =>
				option.setName("ephemeral")
					.setDescription("Affiche la réponse uniquement à l'utilisateur.")),
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
		const isEphemeral = interaction.options.getBoolean("ephemeral")??true;
		let embed = new EmbedBuilder();
		embed.setTitle(`Commandes disponibles sur ${interaction.guild.name} :`);
		embed.setDescription('Liste toutes les commandes disponibles sur ce serveur.');
		embed.setColor('#0099ff');
		embed.setTimestamp();
		embed.setFooter({ text: 'Bot créé par kai_you' });
		let bool = 1;
		let partie1 = '';
		let partie2 = '';
		let partie3 = '';
		let partie4 = '';
		let ob1 = { name: '\u200B', value: '' };
		let ob2 = { name: '\u200B', value: '' };
		let ob3 = { name: '\u200B', value: '' };
		let ob4 = { name: '\u200B', value: '' };
		await interaction.guild.commands.fetch().then(commands =>
			commands.forEach(command => {
				let commandsList = `- **</${command.name}:${command.id}>** - ${command.description}`;
				if (command.default_member_permissions) {
					switch (command.default_member_permissions) {
						case '8':
							commandsList += " (👨‍✈️)";
							break;
						case '2':
							commandsList += " (👨‍💼)";
							break;
						case '4':
							commandsList += " (👩‍💻)";
							break;
						case '1099511627776':
							commandsList += " (👮‍♂️)";
							break;
					}
				}
				commandsList += "\n";
				switch (bool) {
					case 1:
						partie1 += commandsList;
						bool++;
						break;
					case 2:
						partie2 += commandsList;
						bool++;
						break;
					case 3:
						partie3 += commandsList;
						bool++;
						break;
					case 4:
						partie4 += commandsList;
						bool = 1;
						break;
				}
			}));
		ob1.value = partie1;
		ob2.value = partie2;
		ob3.value = partie3;
		ob4.value = partie4;
		ob1.inline = true;
		ob2.inline = true;
		ob3.inline = true;
		ob4.inline = true;
		console.log(partie1.length, partie2.length);
		let ha = { name: 'Légende : ', value: "- 👨‍✈️ : Administrateur\n- 👩‍💻 : Permission de bannir\n- 👨‍💼 : Permission de Kick\n- 👮‍♂️ : Permission de Timeout", inline: false }
		try {
			embed.addFields(
				ha,
				ob1,
				ob2,
				{ name: '\u200B', value: '\u200B' },
				ob3,
				ob4);
		}
		catch (error) {
			console.error(error);
		}
		await interaction.reply({ embeds: [embed], ephemeral: isEphemeral });
	},
};