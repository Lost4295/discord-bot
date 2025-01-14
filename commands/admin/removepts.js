const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removepts')
        .setDescription('Enlever des points à un membre.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('Le membre sélectionné.')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('pts')
                .setDescription('Le nombre de points à retirer. Pour un nombre décimal, ajouter un point(.).')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('La raison du retrait de points.'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const pts = interaction.options.getString('pts') ?? 0;
        const reason = interaction.options.getString('reason') ?? 'Aucune raison fournie';

        await interaction.reply(" Retrait de points ( " + pts + " ) à " + target.username);

        const pool = require("../../db.js");
        pool.getConnection(async function (err, connection) {
            connection.query('SELECT * FROM users where user_id = ' + target.id, async function (error, results) {
                if (error) throw error;
                console.log(results);
                if (results[0] == null) {
                    await interaction.followUp(target.username + ' n\'est pas inscrit dans la base de données de Couch Bot. ');
                } else {
                    connection.query('INSERT INTO points_s2 (user_id, points, reason) VALUES (?,?,?)', [target.id, -pts, reason], async function (error) {
                        if (error) throw error;
                    })
                    connection.query('UPDATE users SET points_s2 = points_s2 - ' + pts + ' where user_id = ' + target.id, async function (error, results) {
                        if (error) throw error;
                        console.log(results);
                        await interaction.followUp('Points retirés avec succès');
                    })
                };
            });
            pool.releaseConnection(connection);
        });
    }
};