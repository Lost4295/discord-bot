const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('block')
        .setDescription('Bloque un membre.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('Le membre à bloquer')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const pool = require("../../db.js");
        pool.getConnection(function (err, connection) {
            connection.query('SELECT * from blocked_users WHERE user_id = ' + target.id, async function (error, results) {
                if (error) throw error;
                console.log(results);
                if (results.length == 0) {
                    connection.query('INSERT INTO blocked_users (user_id) VALUES (?)', [target.id], async function (error) {
                        if (error) {
                            if (error.code === 'ER_DUP_ENTRY') { await interaction.reply(target.username + ' est déjà bloqué.'); }
                            else if (error.code === 'ER_NO_REFERENCED_ROW_2') { await interaction.reply('L\'utilisateur n\'existe pas.'); } else {
                                throw error;
                            }
                        } else {
                            await interaction.reply({content:target.username + ' a été bloqué avec succès.'});
                        }
                    });
                } else {
                    await interaction.reply({content: target.username + ' est déjà bloqué.'});
                }
            });
            pool.releaseConnection(connection);
        });
    },
};