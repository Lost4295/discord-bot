const { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { PASS, USER } = require('../../config.json');

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
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                interaction.reply('La base de données ne fonctionne pas.');
                pool.releaseConnection(connection);
                return;
            }
            connection.query('SELECT * from blocked_users WHERE user_id = ' + target.id, async function (error, results, fields) {
                if (error) throw error;
                console.log(results);
                if (results.length == 1) {
                    connection.query('DELETE FROM blocked_users WHERE user_id = ?', [target.id], async function (error, results, fields) {
                        if (error) throw error;
                        await interaction.reply(target.username + ' a été débloqué avec succès.');
                    });
                } else {
                    await interaction.reply(target.username + ' n\'est pas bloqué.');
                }
            });
            pool.releaseConnection(connection);
        });
    },
};