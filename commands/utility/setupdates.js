const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupdates')
        .setDescription('Afin de pouvoir permettre la bonne exécution du bot. Setup des dates de fin de trimestre.')
        .addIntegerOption(option =>
            option
                .setName('start_year')
                .setChoices(
                    { name: '2024', value: 2024 },
                    { name: '2025', value: 2025 },
                    { name: '2026', value: 2026 },
                    { name: '2027', value: 2027 },
                )
                .setDescription('L\'année de début du trimestre.')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('start_month')
                .setChoices(
                    { name: 'Janvier', value: 1 },
                    { name: 'Février', value: 2 },
                    { name: 'Mars', value: 3 },
                    { name: 'Avril', value: 4 },
                    { name: 'Mai', value: 5 },
                    { name: 'Juin', value: 6 },
                    { name: 'Juillet', value: 7 },
                    { name: 'Août', value: 8 },
                    { name: 'Septembre', value: 9 },
                    { name: 'Octobre', value: 10 },
                    { name: 'Novembre', value: 11 },
                    { name: 'Décembre', value: 12 },
                )
                .setDescription('Le mois de début du trimestre.')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('start_day')
                .setMinValue(1)
                .setMaxValue(31)
                .setDescription('Le jour de début du trimestre.')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('end_year')
                .setChoices(
                    { name: '2024', value: 2024 },
                    { name: '2025', value: 2025 },
                    { name: '2026', value: 2026 },
                    { name: '2027', value: 2027 },
                )
                .setDescription('L\'année de fin du trimestre.')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('end_month')
                .setChoices(
                    { name: 'Janvier', value: 1 },
                    { name: 'Février', value: 2 },
                    { name: 'Mars', value: 3 },
                    { name: 'Avril', value: 4 },
                    { name: 'Mai', value: 5 },
                    { name: 'Juin', value: 6 },
                    { name: 'Juillet', value: 7 },
                    { name: 'Août', value: 8 },
                    { name: 'Septembre', value: 9 },
                    { name: 'Octobre', value: 10 },
                    { name: 'Novembre', value: 11 },
                    { name: 'Décembre', value: 12 },
                )
                .setDescription('Le mois de fin du trimestre.')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('end_day')
                .setMinValue(1)
                .setMaxValue(31)
                .setDescription('Le jour de fin du trimestre.')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('niveau')
                .setDescription('Le niveau de la classe.')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('trimestre')
                .setChoices(
                    { name: '1', value: 1 },
                    { name: '2', value: 2 },
                    { name: '3', value: 3 },
                )
                .setDescription('Le trimestre.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    ,
    async execute(interaction) {

        const start_year = interaction.options.getInteger('start_year');
        const start_month = interaction.options.getInteger('start_month');
        const start_day = interaction.options.getInteger('start_day');
        const end_year = interaction.options.getInteger('end_year');
        const end_month = interaction.options.getInteger('end_month');
        const end_day = interaction.options.getInteger('end_day');
        const niveau = interaction.options.getString('niveau');
        const trimestre = interaction.options.getInteger('trimestre');
        await interaction.deferReply();

        const pool = require("../../db.js");
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                interaction.reply({ content: 'La base de données ne fonctionne pas.' });
                pool.releaseConnection(connection);
                return;
            }
            const date_debut = dayjs({ year: start_year, month: start_month - 1, day: start_day, hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm:ss');
            const date_fin = dayjs({ year: end_year, month: end_month - 1, day: end_day, hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm:ss');

            console.log(date_debut);
            connection.query('DELETE FROM trimestre WHERE niveau = ? and trimestre = ?', [niveau, trimestre], async function (error) {
                if (error) throw error;
                connection.query('INSERT INTO trimestre (niveau, trimestre, date_debut, date_fin) VALUES (?, ?, TIMESTAMP(?), TIMESTAMP(?))', [niveau, trimestre, date_debut, date_fin], function (error) {
                    if (error) throw error;
                })
                await interaction.reply({ content: `Les dates de fin de trimestre pour le niveau ${niveau} et le trimestre ${trimestre} ont été mises à jour, de ${date_debut} à ${date_fin}.` });
            })
            pool.releaseConnection(connection);
        });
    }
}