const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { PASS, USER } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('people')
        .setDescription('Donne la liste des personnes inscrites.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async execute(interaction) {
        const pool = require("../../db.js");
        pool.getConnection(function (err, connection) {
            connection.query('SELECT * FROM users', async function (error, results, fields) {
                if (error) throw error;
                console.log(results);
                let str = "Membres inscrits dans la base de données de Couch Bot : \n";
                for (let membre of results) {
                    str += ` -  ${membre.pseudo} : ${membre.prenom} ${membre.nom} \n`;
                }
                await interaction.reply(str);
            });
            pool.releaseConnection(connection);
        });
    }
};
