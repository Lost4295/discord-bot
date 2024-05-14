const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Sélectionnez un membre et expulsez-le.')
    .addUserOption(option =>
        option
            .setName('cible')
            .setDescription('Le membre à expulser')
            .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const cible = interaction.options.getUser('cible');
        const raison = interaction.options.getString('raison') ?? 'Aucune raison fournie';

        await interaction.reply(`Expulsion de ${cible.username} pour la raison : ${raison}`);
        await interaction.guild.members.kick(cible);
    },
};
