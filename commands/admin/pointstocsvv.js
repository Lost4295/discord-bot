//TODO : refaire

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const Buffer = require('buffer').Buffer;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ptstocsv')
        .setDescription('Génère un fichier CSV des points des membres.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('classe')
                .setDescription('Un niveau de classe pour filtrer les points.')
                .setRequired(false))
        .setDMPermission(true),
    async execute(interaction) {
        
		await interaction.reply("Cette commande ne fonctionne pas pour l'instant, mais elle le sera très vite ! Demandez à <@349983254373466114> pour avoir la réponse à votre demande.");
		return;
        const classe = interaction.options.getString('classe') ?? null;
        const pool = require("../../db.js");
        await interaction.deferReply();
        pool.getConnection(async function (err, connection) {
            let csv;
            if (classe === undefined || classe === null || classe === '') {
                connection.query(`SELECT nom, prenom, classe,
                    ROUND(if (points  >=8 and is_admin=2, 8,(if(points >=6 and is_admin=1,6,
                    if (points >=4 and is_admin=0,4,points )))),2) as points   from users`, async function (error, results) {
                    if (error) throw error;
                    csv = convertToCSV(results);
                    fs.writeFile('points.csv', Buffer.from(csv), async function (err) {
                        if (err) {
                            await interaction.editReply({ content: "Une erreur est survenue lors de la génération du fichier." });
                            throw err;
                        }
                        await interaction.editReply({ content: "Voici votre fichier.", files: ['points.csv'] });
                        console.log('File is created successfully.');
                    });
                });
            } else if (classe.includes(',')) {
                csv = [];
                const ca = classe.split(',');
                const promises = ca.map(cl => {
                    return new Promise((resolve, reject) => {
                        connection.query(`SELECT nom, prenom, classe, ROUND(if (points  >=8 and is_admin=2, 8,(if(points >=6 and is_admin=1,6,
                            if (points >=4 and is_admin=0,4,points )))),2) as points from users WHERE classe LIKE ?`, [cl.trim() + "%"], function (error, results) {
                            if (error) { reject(); throw error; }
                            resolve(results);
                        })
                    })
                });
                Promise.allSettled(
                    promises
                ).then((rests) => {
                    rests.forEach((rest) => {
                        if (rest.status === 'fulfilled') {
                            csv = csv.concat(rest.value);
                        }
                    });
                    csv = convertToCSV(csv);
                    fs.writeFile('points.csv', Buffer.from(csv), async function (err) {
                        if (err) {
                            await interaction.editReply({ content: "Une erreur est survenue lors de la génération du fichier." });
                            throw err;
                        }
                        await interaction.editReply({ content: "Voici votre fichier.", files: ['points.csv'] });
                        console.log('File is created successfully.');
                    });
                });
            } else {
                connection.query(`SELECT nom, prenom, classe, 
                    ROUND(if (points  >=8 and is_admin=2, 8,(if(points >=6 and is_admin=1,6,
                    if (points >=4 and is_admin=0,4,points )))),2) as points  from users WHERE classe LIKE ?`,
                    [classe + "%"], async function (error, results) {
                        if (error) throw error;
                        console.log(results);
                        if (results.length == 0) {
                            await interaction.editReply({ content: "Aucun utilisateur trouvé." });
                            return;
                        }
                        csv = convertToCSV(results);
                        fs.writeFile('points.csv', Buffer.from(csv), async function (err) {
                            if (err) {
                                await interaction.editReply({ content: "Une erreur est survenue lors de la génération du fichier." });
                                throw err;
                            }
                            await interaction.editReply({ content: "Voici votre fichier.", files: ['points.csv'] });
                            console.log('File is created successfully.');
                        });
                    });
            }
            pool.releaseConnection(connection);
        });
    }
};

function convertToCSV(arr) {
    const array = [Object.keys(arr[0])].concat(arr)
    return array.map(row => {
        return Object.values(row).map(value => {
            return typeof value === 'string' ? JSON.stringify(value) : value
        }).toString()
    }).join('\n')
}

