const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Exclut un membre.')
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
        const cible = interaction.options.getMember('cible');
        const duree = interaction.options.getNumber('duree');
        await interaction.reply({content:`Exclusion de ${cible.nickname?cible.nickname:cible.user.username} (${cible.user.username}) pendant ${duree} secondes.`});
        await cible.timeout(duree*1000); 
    },
};
