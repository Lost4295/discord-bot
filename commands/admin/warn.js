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
        await interaction.reply({content:`Avertissement de <@${cible.id}> pour comportement inapproprié.`});
        const pool = require("../../db.js");
        pool.getConnection(async function (err, connection) {
            if (err) {
                console.log(err);
                interaction.reply({content:'La base de données ne fonctionne pas.'});
                pool.releaseConnection(connection);
                return;
            }
            await interaction.deferReply();
            connection.query('UPDATE USERS SET warns = warns + 1 WHERE id = ?', [cible.id], async function (error) {
                if (error) throw error;
                connection.query(
                    'SELECT warns FROM users where id = ?',
                    [cible.id],
                    async function (error, results) {
                        if (error) throw error;
                        console.log(results);
                        if (results[0].warns >= 3) {
                            await interaction.followUp({content:`Expulsion de ${cible.username} pour avoir reçu 3 avertissements.`});
                            await interaction.guild.members.kick(cible);
                        }
                    });
            });
            pool.releaseConnection(connection);
        })
    },
};
