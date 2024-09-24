const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { PASS, USER } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('people')
        .setDescription('Donne la liste des personnes inscrites.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async execute(interaction) {
        const mysql = require('mysql2');
        const connection = mysql.createConnection({
            host: 'localhost',
            user: USER,
            password: PASS,
            database: 'bot'
        });
        connection.connect();
        connection.query('SELECT * FROM users', async function (error, results, fields) {
            if (error) throw error;
            console.log(results);
            let str = "Membres inscrits dans la base de données de Couch Bot : \n";
            for (let i = 0; i < results.length; i++) {
                str += "- " + results[i].user_id + " : " + results[i].username + "\n";
            }
            await interaction.reply(str);
        }
        )
    }
};
