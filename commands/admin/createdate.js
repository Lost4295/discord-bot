const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { PASS, USER } = require('../../config.json');
const dayjs = require('dayjs')
var objectSupport = require("dayjs/plugin/objectSupport");
dayjs.extend(objectSupport);
module.exports = {
	data: new SlashCommandBuilder()
		.setName('createdate')
		.setDescription('Crée un nouvel événement.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false)
		.addStringOption(option =>
			option
				.setName('title')
				.setDescription('Le titre de l\'événement.')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('description')
				.setDescription('La description de l\'événement.')
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName('year')
				.setChoices(
					{ name: '2024', value: 2024 },
					{ name: '2025', value: 2025 },
					{ name: '2026', value: 2026 },
					{ name: '2027', value: 2027 },
				)
				.setDescription('L\'année de l\'événement.')
				.setRequired(true))
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
				.setDescription('Le mois de l\'événement.')
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName('day')
				.setMinValue(1)
				.setMaxValue(31)
				.setDescription('Le jour de l\'événement.')
				.setRequired(true))
		.addBooleanOption(option =>
			option
				.setName('distanciel')
				.setDescription('L\'événement est-il en distanciel ?')
				.setRequired(true))
	,
	async execute(interaction) {

		const title = interaction.options.getString('title');
		const description = interaction.options.getString('description');
		const year = interaction.options.getInteger('year');
		const month = interaction.options.getInteger('month');
		const day = interaction.options.getInteger('day');
		const distanciel = interaction.options.getBoolean('distanciel');

		var mysql = require('mysql');
		var connection = mysql.createConnection({
			host: '127.0.0.1',
			user: USER,
			password: PASS,
			database: 'bot'
		});
		var date = dayjs({ year: year, month: month - 1, day: day, hour: 14, minute: 0, second:0, millisecond:0}).format('YYYY-MM-DD HH:mm:ss');
		console.log(date);
		connection.connect();
		connection.query('INSERT INTO dates (title, description, date, distanciel) VALUES (?, ?, TIMESTAMP(?), ?)', [title, description, date, distanciel],
			async function (error, resultats, fields) {
				if (error) throw error;
				console.log(resultats);
				await interaction.reply({ content: 'L\'événement a bien été ajouté.', ephemeral: true });
			});
		
	},
};