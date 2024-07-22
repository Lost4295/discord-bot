const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Sélectionnez un membre et avertissez-le.')
        .addUserOption(option =>
            option
                .setName('cible')
                .setDescription('Le membre à avertir')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const cible = interaction.options.getUser('cible');
        const raison = interaction.options.getString('raison') ?? 'Aucune raison fournie';

        await interaction.reply(`Avertissement de ${cible.username} pour la raison : ${raison}`);
        var mysql = require('mysql');
        var connection = mysql.createConnection({
            host: '127.0.0.1',
            user: USER,
            password: PASS,
            database: 'bot'
        });
        connection.connect();
        connection.query(
            'UPDATE USERS SET warns = warns + 1 WHERE user_id = ?',
            [cible.id, cible.id],
            async function (error, results, fields) {
                if (error) throw error;
                connection.query(
                    'SELECT warns FROM users where user_id = ?',
                    [cible.id],
                    async function (error, results, fields) {
                        if (error) throw error;
                        console.log(results);
                        if (results[0].warns >= 3) {
                            await interaction.reply(`Expulsion de ${cible.username} pour avoir reçu 3 avertissements.`);
                            await interaction.guild.members.kick(cible);
                        }
                    });
            });
    },
};
