const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('newquestion')
        .setDescription('Propose une nouvelle question pour la commande connect.')
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('La question à ajouter')
                .setRequired(true))
        .addBooleanOption(option =>
            option
                .setName('réponse')
                .setDescription('La réponse à la question est elle vraie ou fausse ?')
                .setRequired(true)
        ),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const answer = interaction.options.getBoolean('réponse');
        const pool = require("../../db.js");
        pool.getConnection(async function (err, connection) {
            await interaction.deferReply();
            connection.query('INSERT INTO questions (question, answer, valid, user_id) VALUES (?, ?, ?, ?)', [question, answer, 0, interaction.user.id], async function (error, results) {
                if (error) throw error;
                console.log(results);
                await interaction.editReply({content:'La question a bien été ajoutée.'});
            });
            pool.releaseConnection(connection);
        });
    }

};