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
        ,
    async execute(interaction) {
        if (interaction.options.getString('message').length > 2000) {
            await interaction.user.send({content:"Le message est trop long !"});
            return;
        }
        await interaction.reply('Pong!');
        await interaction.deleteReply();
        await interaction.channel.send({content:interaction.options.getString('message')});
    }
};
