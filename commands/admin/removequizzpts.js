const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removequizzpts')
        .setDescription('Enlever des points à un membre pour les quizzes.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('Le membre sélectionné.')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('pts')
                .setDescription('Le nombre de points à retirer.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const pts = interaction.options.getString('pts') ?? 0;
        const pool = require("../../db.js");
        pool.getConnection(async function (err, connection) {
            connection.query('SELECT * FROM users where id = ' + target.id, async function (error, results) {
                if (error) throw error;
                console.log(results);
                if (results[0] == null) {
                    await interaction.reply({content:target.username + ' n\'est pas inscrit dans la base de données de Couch Bot. '});
                } else {
                    connection.query('Insert into quizzpoints (user_id, points) VALUES (?, ?)', [target.id, -pts], async function (error, results) {
                        if (error) throw error;
                        console.log(results);
                        await interaction.reply({content:'Points ( ' + pts + ' ) retirés avec succès à ' + target.username});
                    })
                };
            });
            pool.releaseConnection(connection);
        });
    }
};