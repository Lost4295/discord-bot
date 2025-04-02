const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

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
        const pool = require("../../db.js");
        pool.getConnection(async function (err, connection) {
            if (err) {
                console.log(err);
                interaction.reply({content:'La base de données ne fonctionne pas.'});
                pool.releaseConnection(connection);
                return;
            }
            await interaction.deferReply();
            connection.query('DELETE FROM important WHERE name = "channel"', async function (error) {
                if (error) throw error;
                connection.query('INSERT INTO important (name, value) VALUES ("channel", "' + channel + '")', function (error) {
                    if (error) throw error;
                })
                await interaction.reply({content:`Le channel ${channel} a été défini comme channel d'envoi par défaut du bot.`});
            })
            pool.releaseConnection(connection);
        });
    }
}