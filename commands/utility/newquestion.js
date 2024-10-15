const { SlashCommandBuilder } = require('discord.js');
const { PASS, USER } = require('../../config.json');


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
        pool.getConnection(function (err, connection) {
            connection.query('INSERT INTO questions (question, answer, valid, user_id) VALUES (?, ?, ?, ?)', [question, answer, 0, interaction.user.id], async function (error, results, fields) {
                if (error) throw error;
                console.log(results);
                await interaction.reply('La question a bien été ajoutée.');
            });
            pool.releaseConnection(connection);
        });
    }

};