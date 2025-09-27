const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(interaction) {
        if (interaction.author.bot) return;
        const channel = interaction.client.channels.cache.get('1029333231419535401');
        channel.send({content:`**${interaction.user.tag}** a quitté le serveur. Effacement de ses données...`}); 
        const pool = require("../db.js");
        pool.getConnection(function (err, connection) {
            connection.query('DELETE from users where discord_id = ' + interaction.user.id, async function (error, results) {
                if (error){
                    console.log(error);
                    channel.send({content:`Erreur lors de l'effacement des données de **${interaction.user.tag}**. Vérifiez si l'utilisateur est bien inscrit dans la base de données.`});
                    return;
                }
                console.log(results);
                channel.send({content:`Données de **${interaction.user.tag}** effacées.`});
            });
        });
    },
};