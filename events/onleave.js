const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        console.log(`${member.user.tag} a quitté le serveur.`);
        const channel = member.client.channels.cache.get('1029333231419535401');
        channel.send({content:`**${member.user.tag}** a quitté le serveur. Effacement de ses données...`}); 
        const pool = require("../db.js");
        pool.getConnection(function (err, connection) {
            connection.query('DELETE from users where id = ' + member.user.id, async function (error, results) {
                if (error){
                    console.log(error);
                    channel.send({content:`Erreur lors de l'effacement des données de **${member.user.tag}**. Vérifiez si l'utilisateur est bien inscrit dans la base de données.`});
                    return;
                }
                console.log(results);
                channel.send({content:`Données de **${member.user.tag}** effacées.`});
            });
        });
    },
};