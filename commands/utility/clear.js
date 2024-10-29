const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Efface les messages.')
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Le nombre de messages à effacer.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const nombre = interaction.options.getInteger('nombre');
        if (nombre < 1 || nombre > 100) {
            await interaction.reply({ content: 'Vous devez entrer un nombre entre 1 et 100.', ephemeral: true });
        } else {
            await interaction.client.channels.cache.get(interaction.channel.id).bulkDelete(nombre);
            await interaction.reply({ content: `J'ai effacé ${nombre} messages.`, ephemeral: true });
        }
    }
}