const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Sélectionnez un membre et enlevez lui son exclusion.')
    .addUserOption(option =>
        option
            .setName('cible')
            .setDescription('Le membre à gracier')
            .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const cible = interaction.options.getUser('cible');
        await interaction.reply(`${cible.username} vient d'être gracié !`);
        await cible.timeout(null); 
    },
};
