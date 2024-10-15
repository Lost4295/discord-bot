const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { PASS, USER } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Avertit un membre.')
        .addUserOption(option =>
            option
                .setName('cible')
                .setDescription('Le membre à avertir')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const cible = interaction.options.getUser('cible');
        await interaction.reply(`Avertissement de <@${cible.id}> pour comportement inapproprié.`);
        const pool = require("../../db.js");
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                interaction.reply('La base de données ne fonctionne pas.');
                pool.releaseConnection(connection);
                return;
            }
            connection.query('UPDATE USERS SET warns = warns + 1 WHERE user_id = ?', [cible.id, cible.id], async function (error, results, fields) {
                if (error) throw error;
                connection.query(
                    'SELECT warns FROM users where user_id = ?',
                    [cible.id],
                    async function (error, results, fields) {
                        if (error) throw error;
                        console.log(results);
                        if (results[0].warns >= 3) {
                            await interaction.followUp(`Expulsion de ${cible.username} pour avoir reçu 3 avertissements.`);
                            await interaction.guild.members.kick(cible);
                        }
                    });
            });
            pool.releaseConnection(connection);
        })
    },
};
