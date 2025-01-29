const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(interaction) {
        if (interaction.author.bot) return;
        const channel = interaction.client.channels.cache.get('1029333231419535401');
        channel.send(`**${interaction.user.tag}** a quitté le serveur. Effacement de ses données...`); 
        const pool = require("../db.js");
        pool.getConnection(function (err, connection) {
            connection.query('DELETE from users WHERE user_id = ' + interaction.user.id, async function (error, results) {
                if (error){
                    console.log(error);
                    channel.send(`Erreur lors de l'effacement des données de **${interaction.user.tag}**.`);
                    return;
                }
                console.log(results);
                channel.send(`Données de **${interaction.user.tag}** effacées.`);
            });
        });
    },
};