const { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Sélectionnez un membre et débannissez-le.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('Le membre à débannir')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        await interaction.guild.members.unban(target);
        await interaction.reply(`${target.username} a été débanni.`);
    },
};