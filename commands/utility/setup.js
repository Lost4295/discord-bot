const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { USER, PASS } = require('../../config.json');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Afin de pouvoir permettre la bonne exécution du bot.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Le channel où les messages seront envoyés.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        var mysql = require('mysql2');
        var connection = mysql.createConnection({
            host: "localhost",
            user: USER,
            password: PASS,
            database: "bot"
        });
        connection.connect();
        connection.query('DELETE FROM important WHERE name = "channel"', async function (error, resultats, fields) {
            if (error) throw error;
            connection.query('INSERT INTO important (name, value) VALUES ("channel", "' + channel + '")', function (error, resultats, fields) {
                if (error) throw error;
            })
            await interaction.reply(`Le channel ${channel} a été défini comme channel d'envoi par défaut du bot.`);
        })
        
    }
}