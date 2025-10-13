const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const dayjs = require('dayjs')
const objectSupport = require("dayjs/plugin/objectSupport");
dayjs.extend(objectSupport);
module.exports = {
	data: new SlashCommandBuilder()
		.setName('updatedate')
		.setDescription('Modifie un événement.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false)
		.addIntegerOption(option =>
			option
				.setName('id')
				.setDescription('L\'identifiant de l\'événement.')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('title')
				.setDescription('Le titre de l\'événement.'))
		.addStringOption(option =>
			option
				.setName('description')
				.setDescription('La description de l\'événement.'))
		.addIntegerOption(option =>
			option
				.setName('year')
				.setChoices(
					{ name: '2024', value: 2024 },
					{ name: '2025', value: 2025 },
					{ name: '2026', value: 2026 },
					{ name: '2027', value: 2027 },
				)
				.setDescription('L\'année de l\'événement.'))
		.addIntegerOption(option =>
			option
				.setName('month')
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
				.setDescription('Le mois de l\'événement.'))
		.addIntegerOption(option =>
			option
				.setName('day')
				.setMinValue(1)
				.setMaxValue(31)
				.setDescription('Le jour de l\'événement.'))
		.addIntegerOption(option=>
			option
				.setName('hour')
				.setMinValue(0)
				.setMaxValue(23)
				.setDescription('L\'heure de l\'événement.'))
		.addBooleanOption(option =>
			option
				.setName('distanciel')
				.setDescription('L\'événement est-il en distanciel ?'))
	,
	async execute(interaction) {

		const id = interaction.options.getInteger('id');
		
		const pool = require("../../db.js");
		pool.getConnection(async function (err, connection) {
			if (err) {
				console.log(err);
				interaction.reply('La base de données ne fonctionne pas.');
				pool.releaseConnection(connection);
				return;
			}
			await interaction.deferReply();
			connection.query('SELECT * FROM dates WHERE id = ' + id,
				async function (error, resultats) {
					if (error) throw error;
					console.log(resultats);
					if (resultats.length == 0) {
						await interaction.reply({ content: 'L\'événement n\'existe pas.', flags: MessageFlags.Ephemeral });
						return;
					}
					const dateres = new Date(Date.parse(resultats[0].date));
					console.log(dateres); 
					const title = interaction.options.getString('title')??resultats[0].title;
					const description = interaction.options.getString('description')??resultats[0].description;
					const year = interaction.options.getInteger('year')??dateres.getFullYear();
					const day = interaction.options.getInteger('day')??dateres.getDate();
					const month = interaction.options.getInteger('month')??dateres.getMonth()+1;
					const hour = interaction.options.getInteger('hour')??dateres.getHours();
					const distanciel = interaction.options.getBoolean('distanciel')??resultats[0].distanciel;
					const date = dayjs({ year: year, month: month - 1, day: day, hour: hour, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm:ss');
					console.log(date);
					connection.query('UPDATE dates set title=?, description=?, date=TIMESTAMP(?), distanciel=? WHERE id =?', [title, description, date, distanciel, id],
						async function (error, resultats) {
							if (error) throw error;
							console.log(resultats);
							await interaction.editReply({ content: 'L\'événement a bien été modifié.', flags: MessageFlags.Ephemeral });
						});
				});
			pool.releaseConnection(connection);
		});
	},
};