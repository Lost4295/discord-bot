const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Répète le message, sous la forme d\'un embed.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('title')
                .setDescription('Le titre de l\'embed.')
                .setRequired(false))
            
        .addStringOption(option =>
            option
                .setName('description')
                .setDescription('La description de l\'embed.')
                .setRequired(false))
        .addStringOption(option =>
            option
                .setName('footer')
                .setDescription('Le footer de l\'embed.')
                .setRequired(false))
        .addStringOption(option =>
            option
                .setName('image')
                .setDescription('L\'image de l\'embed.')
                .setRequired(false))
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const channel = interaction.channel;
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const footer = interaction.options.getString('footer');
        const image = interaction.options.getString('image');
        const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: footer })
        .setImage(image)
        .setColor('#FF0000');
        await interaction.editReply({content: 'Message envoyé !', ephemeral: true});
        await channel.send({ embeds: [embed] });
    }
};
