const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Sélectionnez un membre et excluez-le.')
    .addUserOption(option =>
        option
            .setName('cible')
            .setDescription('Le membre à exclure')
            .setRequired(true))
            .addNumberOption(option =>
                option
                    .setName('duree')
                    .setDescription('La durée de l\'exclusion, en secondes.')
                    .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const cible = interaction.options.getUser('cible');
        const duree = interaction.options.getNumber('duree');
        await interaction.reply(`Exclusion de ${cible.username} pendant ${duree} secondes.`);
        await cible.timeout(duree*1000); 
    },
};
