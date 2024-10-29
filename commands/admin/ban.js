const { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannit un membre.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('Le membre à bannir')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('La raison du bannissement'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') ?? 'Aucune raison fournie';
        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirmer le bannissement')
            .setStyle(ButtonStyle.Danger);

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Annuler')
            .setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder()
            .addComponents(cancel, confirm);

        const response = await interaction.reply({
            content: `Êtes-vous sûr de vouloir bannir ${target} pour la raison suivante : ${reason} ?`,
            components: [row],
        });
        const collectorFilter = i => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000, max:1 });
            if (confirmation.customId === 'confirm') {
                await interaction.guild.members.ban(target);
                await confirmation.update({ content: `${target.username} a été banni pour la raison suivante : ${reason}`, components: [] });
            } else if (confirmation.customId === 'cancel') {
                await confirmation.update({ content: 'Action annulée', components: [] });
            }
        } catch (e) {
            console.error(e);
            await interaction.editReply({ content: 'Confirmation non reçue dans l\'intervalle d\'1 minute, annulation', components: [] });
        }
    },
};