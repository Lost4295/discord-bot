const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Note la présence d\'un membre à une séance en présentiel.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('Le membre sélectionné')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const pool = require("../../db.js");
        pool.getConnection(async function (err, connection) {
            await interaction.deferReply();
            connection.query('SELECT * FROM users where user_id = ' + target.id, async function (error, results) {
                if (error) throw error;
                console.log(results);
                if (results[0] == null) {
                    await interaction.editReply({content: target.username + ' n\'est pas inscrit dans la base de données de Couch Bot. '});
                } else {
                    connection.query('INSERT INTO points (user_id, points, reason) VALUES (?,?,?)', [target.id, 0.5, "Présence à l'association en présentiel"], async function (error) {
                        if (error) throw error;
                        console.log(results);
                        await interaction.editReply({content: `<@${target.id}> a bien été enregistré comme présent à l'association !`});
                    })
                };
            });
            pool.releaseConnection(connection);
        });
    }
};