const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { PASS, USER } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Change les informations liées à l\'utilisateur.')
		.setDMPermission(false)
		.addSubcommandGroup(group =>
			group
				.setName('visibility')
				.setDescription('Gérer la visibilité de votre profil.')
				.addSubcommand(option =>
					option
						.setName('off')
						.setDescription('Rendre votre profil privé.'))
				.addSubcommand(option =>
					option
						.setName('on')
						.setDescription('Rendre votre profil public.')))
		.addSubcommandGroup(group =>
			group
				.setName('pseudo')
				.setDescription('Changer votre pseudo.')
				.addSubcommand(option =>
					option
						.setName('set')
						.setDescription('Changer votre pseudo.')
						.addStringOption(option =>
							option
								.setName('pseudo')
								.setDescription('Votre nouveau pseudo.')
								.setRequired(true)))
		)
		.addSubcommandGroup(group =>
			group
				.setName('prénom')
				.setDescription('Changer votre prénom.')
				.addSubcommand(option =>
					option
						.setName('set')
						.setDescription('Changer votre prénom.')
						.addStringOption(option =>
							option
								.setName('prénom')
								.setDescription('Votre nouveau prénom.')
								.setRequired(true))))
		.addSubcommandGroup(group =>
			group
				.setName('nom')
				.setDescription('Changer votre nom.')
				.addSubcommand(option =>
					option
						.setName('set')
						.setDescription('Changer votre nom.')
						.addStringOption(option =>
							option
								.setName('nom')
								.setDescription('Votre nouveau nom.')
								.setRequired(true))))
		.addSubcommandGroup(group =>
			group
				.setName('classe')
				.setDescription('Changer votre classe.')
				.addSubcommand(option =>
					option
						.setName('set')
						.setDescription('Changer votre classe.')
						.addStringOption(option =>
							option
								.setName('classe')
								.setDescription('Votre nouvelle classe.')
								.setRequired(true))))
	,
	async execute(interaction) {
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			host: '127.0.0.1',
			user: USER,
			password: PASS,
			database: 'bot'
		});
		connection.connect();
		connection.query('SELECT * FROM users WHERE user_id =' + interaction.user.id, async function (error, results, fields) {
			if (error) {
				await interaction.reply('Vous n\'êtes pas inscrit dans la base de données de Couch Bot.');
			} else {
				if (interaction.options.getSubcommandGroup() === 'visibility') {
					if (interaction.options.getSubcommand() === 'private') {
						connection.query('UPDATE users SET visibility = 0 WHERE user_id =' + interaction.user.id, async function (error, results, fields) {
							if (error) throw error;
							console.log(results);
						});
					} else if (interaction.options.getSubcommand() === 'public') {
						connection.query('UPDATE users SET visibility = 1 WHERE user_id =' + interaction.user.id, async function (error, results, fields) {
							if (error) throw error;
							console.log(results);
						});
					}
					await interaction.reply('Votre statut a bien été modifié.');
				}
				if (interaction.options.getSubcommandGroup() === 'pseudo') {
					if (interaction.options.getSubcommand() === 'set') {
						const pseudo = interaction.options.getString('pseudo');
						connection.query('UPDATE users SET pseudo = ? WHERE user_id = ?', [pseudo, interaction.user.id], async function (error, results, fields) {
							if (error) throw error;
							console.log(results);
							await interaction.reply('Votre pseudo a bien été modifié.');
						});
					}
				}
				if (interaction.options.getSubcommandGroup() === 'prénom') {
					if (interaction.options.getSubcommand() === 'set') {
						const prenom = interaction.options.getString('prénom');
						connection.query('UPDATE users SET prenom = ? WHERE user_id = ?', [prenom, interaction.user.id], async function (error, results, fields) {
							if (error) throw error;
							console.log(results);
							await interaction.reply('Votre prénom a bien été modifié.');
						});
					}
				}
				if (interaction.options.getSubcommandGroup() === 'nom') {
					if (interaction.options.getSubcommand() === 'set') {
						const nom = interaction.options.getString('nom');
						connection.query('UPDATE users SET nom = ? WHERE user_id = ?', [nom, interaction.user.id], async function (error, results, fields) {
							if (error) throw error;
							console.log(results);
							await interaction.reply('Votre nom a bien été modifié.');
						});
					}
				}
				if (interaction.options.getSubcommandGroup() === 'classe') {
					if (interaction.options.getSubcommand() === 'set') {
						const classe = interaction.options.getString('classe');
						connection.query('UPDATE users SET classe = ? WHERE user_id = ?', [classe, interaction.user.id], async function (error, results, fields) {
							if (error) throw error;
							console.log(results);
							await interaction.reply('Votre classe a bien été modifiée.');
						});
					}
				}
			}
		})
	},
};