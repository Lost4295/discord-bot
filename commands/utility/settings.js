const { SlashCommandBuilder } = require('discord.js');

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
		const pool = require("../../db.js");
		pool.getConnection(async function (err, connection) {
			await interaction.deferReply();
			connection.query('SELECT * FROM users where id =' + interaction.user.id, async function (error) {
				if (error) {
					await interaction.reply({content:'Vous n\'êtes pas inscrit dans la base de données de Couch Bot.', ephemeral: true});
					return;
				}
				if (interaction.options.getSubcommandGroup() === 'visibility') {
					if (interaction.options.getSubcommand() === 'off') {
						connection.query('UPDATE users SET visibility = 0 WHERE id =' + interaction.user.id, async function (error, results) {
							if (error) throw error;
							console.log(results);
						});
					} else if (interaction.options.getSubcommand() === 'on') {
						connection.query('UPDATE users SET visibility = 1 WHERE id =' + interaction.user.id, async function (error, results) {
							if (error) throw error;
							console.log(results);
						});
					}
					await interaction.editReply({content:'Votre statut a bien été modifié.', ephemeral: true});
				}
				if (interaction.options.getSubcommandGroup() === 'pseudo') {
					if (interaction.options.getSubcommand() === 'set') {
						const pseudo = interaction.options.getString('pseudo');
						connection.query('UPDATE users SET pseudo = ? WHERE id = ?', [pseudo, interaction.user.id], async function (error, results) {
							if (error) throw error;
							console.log(results);
							await interaction.editReply({content:'Votre pseudo a bien été modifié.', ephemeral: true});
						});
					}
				}
				if (interaction.options.getSubcommandGroup() === 'prénom') {
					if (interaction.options.getSubcommand() === 'set') {
						const prenom = interaction.options.getString('prénom');
						connection.query('UPDATE users SET prenom = ? WHERE id = ?', [prenom, interaction.user.id], async function (error, results) {
							if (error) throw error;
							console.log(results);
							await interaction.editReply({content:'Votre prénom a bien été modifié.', ephemeral: true});
						});
					}
				}
				if (interaction.options.getSubcommandGroup() === 'nom') {
					if (interaction.options.getSubcommand() === 'set') {
						const nom = interaction.options.getString('nom');
						connection.query('UPDATE users SET nom = ? WHERE id = ?', [nom, interaction.user.id], async function (error, results) {
							if (error) throw error;
							console.log(results);
							await interaction.editReply({content:'Votre nom a bien été modifié.', ephemeral: true});
						});
					}
				}
				if (interaction.options.getSubcommandGroup() === 'classe') {
					if (interaction.options.getSubcommand() === 'set') {
						const classe = interaction.options.getString('classe');
						connection.query('UPDATE users SET classe = ? WHERE id = ?', [classe, interaction.user.id], async function (error, results) {
							if (error) throw error;
							console.log(results);
							await interaction.editReply({content:'Votre classe a bien été modifiée.', ephemeral: true});
						});
					}
				}
			})
			pool.releaseConnection(connection);
		})
	},
};