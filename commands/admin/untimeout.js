const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Enlève l\'exclusion d\'un membre.')
    .addUserOption(option =>
        option
            .setName('cible')
            .setDescription('Le membre à gracier')
            .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const cible = interaction.options.getMember('cible');
        await cible.timeout(null); 
        await interaction.reply(`${cible.nickname?cible.nickname:cible.user.username} (${cible.user.username}) vient d'être gracié !`);
    },
};
