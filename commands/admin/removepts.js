const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { PASS, USER } = require('../../config.json');

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

        var mysql = require('mysql2');
        var connection = mysql.createConnection({
            host: 'localhost',
            user: USER,
            password: PASS,
            database: 'bot'
        });
        connection.connect();
        connection.query('SELECT * FROM users where user_id = ' + target.id, async function (error, results, fields) {
            if (error) throw error;
            console.log(results);
            if (results[0] == null) {
                await interaction.followUp(target.username + ' n\'est pas inscrit dans la base de données de Couch Bot. ');
            } else {
                connection.query('INSERT INTO points (user_id, points, reason) VALUES (?,?,?)', [target.id, -pts, reason], async function (error, results, fields) {
                    if (error) throw error;
                })
                connection.query('UPDATE users SET points = points - ' + pts + ' where user_id = ' + target.id, async function (error, results, fields) {
                    if (error) throw error;
                    console.log(results);
                    await interaction.followUp('Points retirés avec succès');
                })
            };
        });
        
    }
};