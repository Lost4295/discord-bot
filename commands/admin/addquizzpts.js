const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addquizzpts')
        .setDescription('Ajoute des points à un membre pour les Quizzes.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('Le membre sélectionné')
                .setRequired(true))
        .addNumberOption(option =>
            option
                .setName('pts')
                .setDescription('Le nombre de points à ajouter.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const pts = interaction.options.getNumber('pts') ?? 0;
        if (pts == 0) {
            await interaction.reply('Veuillez fournir un nombre de points à ajouter.');
            return;
        } else if (pts < 0) {
            await interaction.reply('Veuillez fournir un nombre de points positif.');
            return;
        } else {

            const pool = require("../../db.js");
            pool.getConnection(function (err, connection) {
                connection.query('SELECT * FROM users where discord_id = ' + target.id, async function (error, results) {
                    if (error) throw error;
                    console.log(results);
                    if (results[0] == null) {
                        await interaction.reply({ content: target.username + ' n\'est pas inscrit dans la base de données de Couch Bot. '});
                        return;
                    }
                    connection.query('INSERT INTO quizzpoints (user_id, points, date) VALUES (' + target.id + ', ' + pts + ', NOW())', async function (error, results) {
                        if (error) throw error;
                        console.log(results);
                    });
                    connection.query('UPDATE users SET quizzpoints = quizzpoints + ' + pts + ' where user_id = ' + target.id, async function (error, results) {
                        if (error) throw error;
                        console.log(results);
                        await interaction.reply({content: 'Points ( ' + pts + ' ) ajoutés avec succès à ' + target.username});
                    })
                });
                pool.releaseConnection(connection);
            });
        }
    }
};