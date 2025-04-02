const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Répète le message.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Le message à répéter.')
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deleteReply();
        await interaction.channel.send({content:interaction.options.getString('message')});
    }
};
