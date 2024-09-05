const { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { PASS, USER } = require('../../config.json');

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
        var mysql = require('mysql2');
        var connection = mysql.createConnection({
            host: '127.0.0.1',
            user: USER,
            password: PASS,
            database: 'bot'
        });
        connection.connect();
        connection.query('SELECT * from blocked_users WHERE user_id = ' + target.id, async function (error, results, fields) {
            if (error) throw error;
            console.log(results);
            if (results.length == 0) {
                connection.query('INSERT INTO blocked_users (user_id) VALUES (?)', [target.id], async function (error, results, fields) {
                    if (error) {
                        if (error.code === 'ER_DUP_ENTRY') { await interaction.reply(target.username + ' est déjà bloqué.'); }
                        else if (error.code === 'ER_NO_REFERENCED_ROW_2') { await interaction.reply('L\'utilisateur n\'existe pas.'); } else {
                            throw error;
                        }
                    } else {
                        await interaction.reply(target.username + ' a été bloqué avec succès.');
                    }
                });
            } else {
                await interaction.reply(target.username + ' est déjà bloqué.');
            }
        });
        
    },
};