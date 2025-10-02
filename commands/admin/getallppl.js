const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getpeople')
        .setDescription('Donne la liste des personnes inscrites.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async execute(interaction) {
        const pool = require("../../db.js");
        pool.getConnection(async function (err, connection) {
            await interaction.deferReply();
            connection.query('SELECT * FROM users', async function (error, results) {
                if (error) throw error;
                console.log(results);
                let str = "Membres inscrits dans la base de données de Couch Bot : \n";
                for (let membre of results) {
                    str += ` -  ${membre.pseudo} : ${membre.prenom} ${membre.nom} \n`;
                }
                if (str.length > 2000) {
                    while (str.length > 0) {
                        await interaction.channel.send({content:str.slice(0, 2000)});
                        str = str.slice(2000);
                    }
                } else {
                    await interaction.editReply({content:str});

                }
            });
            pool.releaseConnection(connection);
        });
    }
};
