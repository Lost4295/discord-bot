const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Débannit un membre.')
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