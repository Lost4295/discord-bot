const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

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
        await interaction.deferReply();
        const pool = require("../../db.js");
        pool.getConnection(async function (err, connection) {
            if (err) {
                console.log(err);
                interaction.reply({ content: 'La base de données ne fonctionne pas.' });
                pool.releaseConnection(connection);
                return;
            }
            connection.query('SELECT * FROM users WHERE id = ?', [cible.id], async function (error, results) {
                if (error) throw error;
                if (results.length === 0) {
                    // Si l'utilisateur n'existe pas, l'ajouter
                    connection.query('INSERT INTO users (id, pseudo, warns, classe, account_valid, nom, access_token, discord_id, date_inscr, roles, avatar, visibility, is_admin, email, prenom ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [cible.id, cible.username, 0, 'define', 0, 'define', '', '', NOW(), '[]', '', 0, 0, 'define', 'define'], function (error) {
                        if (error) throw error;
                    });
                }
            });
            connection.query('UPDATE USERS SET warns = warns + 1 WHERE id = ?', [cible.id], async function (error) {
                if (error) throw error;
                await interaction.editReply({ content: `Avertissement de <@${cible.id}> pour comportement inapproprié.` });jy
                connection.query(
                    'SELECT warns FROM users where id = ?',
                    [cible.id],
                    async function (error, results) {
                        if (error) throw error;
                        console.log(results);
                        if (results[0].warns >= 3) {
                            await interaction.followUp({ content: `Expulsion de ${cible.username} pour avoir reçu 3 avertissements.` });
                            await interaction.guild.members.kick(cible);
                        }
                    });
            });
            pool.releaseConnection(connection);
        })
    },
};
