const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addpts')
        .setDescription('Ajoute des points à un membre.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('Le membre sélectionné')
                .setRequired(true))
        .addNumberOption(option =>
            option
                .setName('pts')
                .setDescription('Le nombre de points à ajouter. Pour un nombre décimal, ajouter un point(.).')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('La raison de l\'ajout de points.'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const pts = interaction.options.getNumber('pts') ?? 0;
        const reason = interaction.options.getString('reason') ?? 'Aucune raison fournie';
        if (pts == 0) {
            await interaction.reply('Veuillez fournir un nombre de points à ajouter.');
            return;
        } else if (pts < 0) {
            await interaction.reply('Veuillez fournir un nombre de points positif.');
            return;
        } else {
            await interaction.reply(" Ajout de points ( " + pts + " ) à " + target.username);

            const pool = require("../../db.js");
            pool.getConnection(function (err, connection) {
                connection.query('SELECT * FROM users where user_id = ' + target.id, async function (error, results) {
                    if (error) throw error;
                    console.log(results);
                    if (results[0] == null) {
                        await interaction.followUp(target.username + ' n\'est pas inscrit dans la base de données de Couch Bot. ');
                        return;
                    }
                    connection.query('INSERT INTO points (user_id, points, reason) VALUES (?,?,?)', [target.id, pts, reason], async function (error) {
                        if (error) throw error;
                    })
                    connection.query('UPDATE users SET points = points + ' + pts + ' where user_id = ' + target.id, async function (error, results) {
                        if (error) throw error;
                        console.log(results);
                        await interaction.followUp('Points ajoutés avec succès');
                    })
                });
                pool.releaseConnection(connection);
            });
        }
    }
};