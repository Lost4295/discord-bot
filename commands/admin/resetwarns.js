const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetwarns')
        .setDescription('Réinitialise les avertissements d\'un utilisateur.')
        .addUserOption(option =>
            option
                .setName('cible')
                .setDescription('Le membre à réinitialiser')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const cible = interaction.options.getUser('cible');
        const pool = require("../../db.js");
        pool.getConnection(async function (err, connection) {
            await interaction.deferReply();
            connection.query('SELECT warns FROM users where user_id = ?', [cible.id], async function (error, results) {
                if (error) throw error;
                console.log(results);
                if (results) {
                    if (results[0].warns == 0) {
                        await interaction.followUp({content:`${cible.username} n'avait pas d'avertissements.`});
                    } else {
                        connection.query(
                            'UPDATE USERS SET warns = 0 WHERE user_id = ?',
                            [cible.id],
                            async function (error) {
                                if (error) throw error;
                                await interaction.reply({content:`Les avertissements de <@${cible.id}> ont été retirés.`});
                            });
                    }
                } else {
                    await interaction.followUp({content:`${cible.username} n'est pas enregistré sur Couch Gaming. Vous pouvez directement le timeout avec /timeout.`});
                }
            });
            pool.releaseConnection(connection);
        });
    },
};
