const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { USER, PASS } = require('../../config.json');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('testsend')
        .setDescription('Afin de pouvoir permettre la bonne exécution du bot.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message que vous voulez envoyer.')
                .setRequired(true)),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        var mysql = require('mysql');
        var connection = mysql.createConnection({
            host: "localhost",
            user: USER,
            password: PASS,
            database: "bot"
        });
        connection.connect();
        connection.query('SELECT * FROM important WHERE name = "channel"', async function (error, results, fields) {
            if (error) throw error;
            console.log(results);
            if (results.length > 0) {
                await interaction.client.channels.cache.get(results[0].value).send('<@' + interaction.user.id + '> : '+ message);
                await interaction.reply('Message envoyé.');
            } else {
                await interaction.reply('Le channel n\'a pas été défini.');
            }
        })
    }
}