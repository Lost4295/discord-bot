const { SlashCommandBuilder, PermissionFlagsBits, PresenceUpdateStatus, ActivityType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('changebot')
		.setDescription('Change l\'état du bot.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false)
		.addStringOption(option =>
			option
				.setName('status')
				.setDescription('L\'état du bot')
				.setRequired(false)
				.addChoices(
					{ name: 'En ligne', value: 'online' },
					{ name: 'Absent', value: 'idle' },
					{ name: 'Ne pas déranger', value: 'dnd' },
					{ name: 'Invisible', value: 'invisible' }))
		.addStringOption(option =>
			option
				.setName('activitytype')
				.setDescription('L\'activité du bot')
				.setRequired(false)
				.addChoices({ name: 'Joue à', value: 'PLAYING' },
					{ name: 'Écoute', value: 'LISTENING' },
					{ name: 'Regarde', value: 'WATCHING' },
					{ name: 'Diffuse', value: 'STREAMING' },
					{ name: 'Compétition', value: 'COMPETING' },
					{ name: 'Personnalisé', value: 'CUSTOM_STATUS' }))
		.addStringOption(option =>
			option
				.setName('activityname')
				.setDescription('Le nom de l\'activité')
				.setRequired(false))
	,
	async execute(interaction) {

		const status = interaction.options.getString('status') ?? null;
		const activityType = interaction.options.getString('activitytype') ?? null;
		const activityName = interaction.options.getString('activityname') ?? null;
		let reply = false;
		if (status) {
			switch (status) {
				case 'online':
					await interaction.reply('Le bot est maintenant en ligne.');
					await interaction.client.user.setStatus(PresenceUpdateStatus.Online);
					break;
				case 'idle':
					await interaction.reply('Le bot est maintenant absent.');
					await interaction.client.user.setStatus(PresenceUpdateStatus.Idle);
					break;
				case 'dnd':
					await interaction.reply('Le bot est maintenant en mode ne pas déranger.');
					await interaction.client.user.setStatus(PresenceUpdateStatus.DoNotDisturb);
					break;
				case 'invisible':
					await interaction.reply('Le bot est maintenant invisible.');
					await interaction.client.user.setStatus(PresenceUpdateStatus.Invisible);
					break;
				default:
					await interaction.reply('Vous devez spécifier un état valide.', { ephemeral: true });
					break;
			}
			reply = true;
		}
		if (activityType && activityName) {
			switch (activityType) {
				case 'PLAYING':
					if (!reply) {
						await interaction.reply('Le bot joue maintenant à ' + activityName, { ephemeral: true });
					} else {
						await interaction.reply('Le bot joue maintenant à ' + activityName, { ephemeral: true });
					}
					await interaction.client.user.setActivity(activityName, { type: ActivityType.Playing });
					break;
				case 'LISTENING':
					if (!reply) {
						await interaction.reply('Le bot écoute maintenant ' + activityName, { ephemeral: true });
					} else {
						await interaction.followUp('Le bot écoute maintenant ' + activityName, { ephemeral: true });
					}
					await interaction.client.user.setActivity(activityName, { type: ActivityType.Listening });
					break;
				case 'WATCHING':
					if (!reply) {
						await interaction.reply('Le bot regarde maintenant ' + activityName, { ephemeral: true });
					} else {
						await interaction.followUp('Le bot regarde maintenant ' + activityName, { ephemeral: true });
					}
					await interaction.client.user.setActivity(activityName, { type: ActivityType.Watching });
					break;
				case 'STREAMING':
					if (!reply) {
						await interaction.reply('Le bot diffuse maintenant ' + activityName, { ephemeral: true });
					} else {
						await interaction.followUp('Le bot diffuse maintenant ' + activityName, { ephemeral: true });
					}
					await interaction.client.user.setActivity(activityName, { type: ActivityType.Streaming });
					break;
				case 'COMPETING':
					if (!reply) {
						await interaction.reply('Le bot est maintenant en compétition sur ' + activityName, { ephemeral: true });
					} else {
						await interaction.followUp('Le bot est maintenant en compétition sur ' + activityName, { ephemeral: true });
					}
					await interaction.client.user.setActivity(activityName, { type: ActivityType.Competing });
					break;
				case 'CUSTOM_STATUS':
					if (!reply) {
						await interaction.reply('Le bot a maintenant un statut personnalisé : ' + activityName, { ephemeral: true });
					} else {
						await interaction.followUp('Le bot a maintenant un statut personnalisé : ' + activityName, { ephemeral: true });
					}
					await interaction.client.user.setActivity(activityName, { type: ActivityType.Custom });
					break;
				default:
					await interaction.reply('Vous devez spécifier un type d\'activité valide.', { ephemeral: true });
					break;
			}
		}
		if (activityType && !activityName) {
			if (activityType === 'None') {
				await interaction.client.user.setActivity(null);
				if (!reply) {
					await interaction.reply('Le bot n\'a plus d\'activité.', { ephemeral: true });
				} else {
					await interaction.followUp('Le bot n\'a plus d\'activité.', { ephemeral: true });
				}
			} else {
				await interaction.reply('Vous devez spécifier un nom d\'activité.', { ephemeral: true });
			}
		}
		if (!activityType && activityName) {
			await interaction.reply('Vous devez spécifier un type d\'activité.', { ephemeral: true });
		}
		if (!activityType && !activityName && !status) {
			await interaction.reply('Vous devez spécifier un état ou une activité.', { ephemeral: true });
		}
	},
};