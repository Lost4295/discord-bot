const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unblock')
        .setDescription('Débloque un membre.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('Le membre à débloquer')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const pool = require("../../db.js");
        pool.getConnection(async function (err, connection) {
            if (err) {
                console.log(err);
                interaction.reply({content:'La base de données ne fonctionne pas.'});
                pool.releaseConnection(connection);
                return;
            }
            await interaction.deferReply();
            connection.query('SELECT * from blocked_users WHERE user_id = ' + target.id, async function (error, results) {
                if (error) throw error;
                console.log(results);
                if (results.length == 1) {
                    connection.query('DELETE FROM blocked_users WHERE user_id = ?', [target.id], async function (error) {
                        if (error) throw error;
                        await interaction.reply({content:target.username + ' a été débloqué avec succès.'});
                    });
                } else {
                    await interaction.reply({content:target.username + ' n\'est pas bloqué.'});
                }
            });
            pool.releaseConnection(connection);
        });
    },
};