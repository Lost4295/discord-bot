const { SlashCommandBuilder, MessageFlags } = require('discord.js');

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
						.setDescription('Changer votre classe.'))
		)
	,
	async execute(interaction) {
		const pool = require("../../db.js");
		pool.getConnection(async function (err, connection) {
			await interaction.deferReply();
			connection.query('SELECT * FROM users where id =' + interaction.user.id, async function (error) {
				if (error) {
					await interaction.reply({ content: 'Vous n\'êtes pas inscrit dans la base de données de Couch Bot.', flags: MessageFlags.Ephemeral });
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
					await interaction.editReply({ content: 'Votre statut a bien été modifié.', flags: MessageFlags.Ephemeral });
				}
				if (interaction.options.getSubcommandGroup() === 'pseudo') {
					if (interaction.options.getSubcommand() === 'set') {
						const pseudo = interaction.options.getString('pseudo');
						connection.query('UPDATE users SET pseudo = ? WHERE id = ?', [pseudo, interaction.user.id], async function (error, results) {
							if (error) throw error;
							console.log(results);
							await interaction.editReply({ content: 'Votre pseudo a bien été modifié.', flags: MessageFlags.Ephemeral });
						});
					}
				}
				if (interaction.options.getSubcommandGroup() === 'prénom') {
					if (interaction.options.getSubcommand() === 'set') {
						const prenom = interaction.options.getString('prénom');
						connection.query('UPDATE users SET prenom = ? WHERE id = ?', [prenom, interaction.user.id], async function (error, results) {
							if (error) throw error;
							console.log(results);
							await interaction.editReply({ content: 'Votre prénom a bien été modifié.', flags: MessageFlags.Ephemeral });
						});
					}
				}
				if (interaction.options.getSubcommandGroup() === 'nom') {
					if (interaction.options.getSubcommand() === 'set') {
						const nom = interaction.options.getString('nom');
						connection.query('UPDATE users SET nom = ? WHERE id = ?', [nom, interaction.user.id], async function (error, results) {
							if (error) throw error;
							console.log(results);
							await interaction.editReply({ content: 'Votre nom a bien été modifié.', flags: MessageFlags.Ephemeral });
						});
					}
				}
				if (interaction.options.getSubcommandGroup() === 'classe') {
					if (interaction.options.getSubcommand() === 'set') {
						function findGroup(classe) {
							const groupMatch = classe.match(/^\d[A-Z]+/);
							if (groupMatch) {
								let regex = new RegExp(groupMatch[0], 'g');
								let res = classe.replace(regex, '');
								return res;
							}
							return null;
						}
						// Étape 3 — classe via menu déroulant
						const classes = [
							{ label: "1A1", description: "Première année Alternance Groupe 1", value: "1A1", emoji: "1️⃣" },
							{ label: "1A2", description: "Première année Alternance Groupe 2", value: "1A2", emoji: "1️⃣" },
							{ label: "1A3", description: "Première année Alternance Groupe 3", value: "1A3", emoji: "1️⃣" },
							{ label: "1A4", description: "Première année Alternance Groupe 4", value: "1A4", emoji: "1️⃣" },
							{ label: "1A5", description: "Première année Alternance Groupe 5", value: "1A5", emoji: "1️⃣" },
							{ label: "1A6", description: "Première année Alternance Groupe 6", value: "1A6", emoji: "1️⃣" },
							{ label: "1A7", description: "Première année Alternance Groupe 7", value: "1A7", emoji: "1️⃣" },
							{ label: "1I1", description: "Première année Initial Groupe 1", value: "1I1", emoji: "1️⃣" },
							{ label: "1I2", description: "Première année Initial Groupe 2", value: "1I2", emoji: "1️⃣" },
							{ label: "2A1", description: "Deuxième année Alternance Groupe 1", value: "2A1", emoji: "2️⃣" },
							{ label: "2A2", description: "Deuxième année Alternance Groupe 2", value: "2A2", emoji: "2️⃣" },
							{ label: "2A3", description: "Deuxième année Alternance Groupe 3", value: "2A3", emoji: "2️⃣" },
							{ label: "2A4", description: "Deuxième année Alternance Groupe 4", value: "2A4", emoji: "2️⃣" },
							{ label: "2A5", description: "Deuxième année Alternance Groupe 5", value: "2A5", emoji: "2️⃣" },
							{ label: "2I1", description: "Deuxième année Initial Groupe 1", value: "2I1", emoji: "2️⃣" },
							{ label: "2I2", description: "Deuxième année Initial Groupe 2", value: "2I2", emoji: "2️⃣" },
							{ label: "2MCSI", description: "Deuxième année MCSI", value: "2MCSI", emoji: "2️⃣" },
							{ label: "3AL1", description: "Troisième année AL Groupe 1", value: "3AL1", emoji: "3️⃣" },
							{ label: "3AL2", description: "Troisième année AL Groupe 2", value: "3AL2", emoji: "3️⃣" },
							{ label: "3IABD1", description: "Troisième année IABD Groupe 1", value: "3IABD1", emoji: "3️⃣" },
							{ label: "3IABD2", description: "Troisième année IABD Groupe 2", value: "3IABD2", emoji: "3️⃣" },
							{ label: "3MOC", description: "Troisième année MOC", value: "3MOC", emoji: "3️⃣" },
							{ label: "3IBC", description: "Troisième année IBC", value: "3IBC", emoji: "3️⃣" },
							{ label: "3IW1", description: "Troisième année IW Groupe 1", value: "3IW1", emoji: "3️⃣" },
							{ label: "3IW2", description: "Troisième année IW Groupe 2", value: "3IW2", emoji: "3️⃣" },
							{ label: "3MCSI1", description: "Troisième année MCSI Groupe 1", value: "3MCSI1", emoji: "3️⃣" },
							{ label: "3MCSI2", description: "Troisième année MCSI Groupe 2", value: "3MCSI2", emoji: "3️⃣" },
							{ label: "3RVJV", description: "Troisième année RVJV", value: "3RVJV", emoji: "3️⃣" },
							{ label: "3SI1", description: "Troisième année SI Groupe 1", value: "3SI1", emoji: "3️⃣" },
							{ label: "3SI2", description: "Troisième année SI Groupe 2", value: "3SI2", emoji: "3️⃣" },
							{ label: "3SI3", description: "Troisième année SI Groupe 3", value: "3SI3", emoji: "3️⃣" },
							{ label: "3SI4", description: "Troisième année SI Groupe 4", value: "3SI4", emoji: "3️⃣" },
							{ label: "3SI5", description: "Troisième année SI Groupe 5", value: "3SI5", emoji: "3️⃣" },
							{ label: "3SRC1", description: "Troisième année SRC Groupe 1", value: "3SRC1", emoji: "3️⃣" },
							{ label: "3SRC2", description: "Troisième année SRC Groupe 2", value: "3SRC2", emoji: "3️⃣" },
							{ label: "3SRC3", description: "Troisième année SRC Groupe 3", value: "3SRC3", emoji: "3️⃣" },
							{ label: "3SRC4", description: "Troisième année SRC Groupe 4", value: "3SRC4", emoji: "3️⃣" },
							{ label: "3SRC5", description: "Troisième année SRC Groupe 5", value: "3SRC5", emoji: "3️⃣" },
							{ label: "4AL1", description: "Quatrième année AL Groupe 1", value: "4AL1", emoji: "4️⃣" },
							{ label: "4AL2", description: "Quatrième année AL Groupe 2", value: "4AL2", emoji: "4️⃣" },
							{ label: "4IABD1", description: "Quatrième année IABD Groupe 1", value: "4IABD1", emoji: "4️⃣" },
							{ label: "4IABD2", description: "Quatrième année IABD Groupe 2", value: "4IABD2", emoji: "4️⃣" },
							{ label: "4MOC", description: "Quatrième année MOC", value: "4MOC", emoji: "4️⃣" },
							{ label: "4IBC", description: "Quatrième année IBC", value: "4IBC", emoji: "4️⃣" },
							{ label: "4IW1", description: "Quatrième année IW Groupe 1", value: "4IW1", emoji: "4️⃣" },
							{ label: "4IW2", description: "Quatrième année IW Groupe 2", value: "4IW2", emoji: "4️⃣" },
							{ label: "4IW3", description: "Quatrième année IW Groupe 3", value: "4IW3", emoji: "4️⃣" },
							{ label: "4MCSI1", description: "Quatrième année MCSI Groupe 1", value: "4MCSI1", emoji: "4️⃣" },
							{ label: "4MCSI2", description: "Quatrième année MCSI Groupe 2", value: "4MCSI2", emoji: "4️⃣" },
							{ label: "4MCSI3", description: "Quatrième année MCSI Groupe 3", value: "4MCSI3", emoji: "4️⃣" },
							{ label: "4MCSI4", description: "Quatrième année MCSI Groupe 4", value: "4MCSI4", emoji: "4️⃣" },
							{ label: "4RVJV", description: "Quatrième année RVJV", value: "4RVJV", emoji: "4️⃣" },
							{ label: "4SI1", description: "Quatrième année SI Groupe 1", value: "4SI1", emoji: "4️⃣" },
							{ label: "4SI2", description: "Quatrième année SI Groupe 2", value: "4SI2", emoji: "4️⃣" },
							{ label: "4SI3", description: "Quatrième année SI Groupe 3", value: "4SI3", emoji: "4️⃣" },
							{ label: "4SI4", description: "Quatrième année SI Groupe 4", value: "4SI4", emoji: "4️⃣" },
							{ label: "4SI5", description: "Quatrième année SI Groupe 5", value: "4SI5", emoji: "4️⃣" },
							{ label: "4SRC1", description: "Quatrième année SRC Groupe 1", value: "4SRC1", emoji: "4️⃣" },
							{ label: "4SRC2", description: "Quatrième année SRC Groupe 2", value: "4SRC2", emoji: "4️⃣" },
							{ label: "4SRC3", description: "Quatrième année SRC Groupe 3", value: "4SRC3", emoji: "4️⃣" },
							{ label: "4SRC4", description: "Quatrième année SRC Groupe 4", value: "4SRC4", emoji: "4️⃣" },
							{ label: "4SRC5", description: "Quatrième année SRC Groupe 5", value: "4SRC5", emoji: "4️⃣" },
							{ label: "5MOC", description: "Cinquième année MOC", value: "5MOC", emoji: "5️⃣" },
							{ label: "5IBC", description: "Cinquième année IBC", value: "5IBC", emoji: "5️⃣" },
							{ label: "5IW1", description: "Cinquième année IW Groupe 1", value: "5IW1", emoji: "5️⃣" },
							{ label: "5IW2", description: "Cinquième année IW Groupe 2", value: "5IW2", emoji: "5️⃣" },
							{ label: "5AL1", description: "Cinquième année AL Groupe 1", value: "5AL1", emoji: "5️⃣" },
							{ label: "5AL2", description: "Cinquième année AL Groupe 2", value: "5AL2", emoji: "5️⃣" },
							{ label: "5MCSI1", description: "Cinquième année MCSI Groupe 1", value: "5MCSI1", emoji: "5️⃣" },
							{ label: "5MCSI2", description: "Cinquième année MCSI Groupe 2", value: "5MCSI2", emoji: "5️⃣" },
							{ label: "5MCSI3", description: "Cinquième année MCSI Groupe 3", value: "5MCSI3", emoji: "5️⃣" },
							{ label: "5IABD1", description: "Cinquième année IABD Groupe 1", value: "5IABD1", emoji: "5️⃣" },
							{ label: "5IABD2", description: "Cinquième année IABD Groupe 2", value: "5IABD2", emoji: "5️⃣" },
							{ label: "5RVJV", description: "Cinquième année RVJV", value: "5RVJV", emoji: "5️⃣" },
							{ label: "5SI1", description: "Cinquième année SI Groupe 1", value: "5SI1", emoji: "5️⃣" },
							{ label: "5SI2", description: "Cinquième année SI Groupe 2", value: "5SI2", emoji: "5️⃣" },
							{ label: "5SI3", description: "Cinquième année SI Groupe 3", value: "5SI3", emoji: "5️⃣" },
							{ label: "5SRC1", description: "Cinquième année SRC Groupe 1", value: "5SRC1", emoji: "5️⃣" },
							{ label: "5SRC2", description: "Cinquième année SRC Groupe 2", value: "5SRC2", emoji: "5️⃣" },
							{ label: "5SRC3", description: "Cinquième année SRC Groupe 3", value: "5SRC3", emoji: "5️⃣" },
							{ label: "5SRC4", description: "Cinquième année SRC Groupe 4", value: "5SRC4", emoji: "5️⃣" },

						];


						const select = new StringSelectMenuBuilder()
							.setCustomId("select_class")
							.setPlaceholder("Sélectionne ta classe")
							.addOptions(classes.map(c => new StringSelectMenuOptionBuilder(c)));

						const row = new ActionRowBuilder().addComponents(select);
						const channel = await interaction.channel
						await channel.send({
							content: "Choisis ta **classe**, et fais bien attention ! Tu as le niveau, et le groupe :",
							components: [row],
						});
						const classe = await new Promise((resolve, reject) => {
							const collector = thread.createMessageComponentCollector({
								componentType: ComponentType.StringSelect,
								time: 60_000,
								max: 1,
								filter: i => i.user.id === user.id,
							});

							collector.on("collect", async i => {
								const choice = i.values[0];
								await i.update({
									content: `Classe sélectionnée : **${choice}**`,
									components: [],
								});
								resolve(choice);
							});

							collector.on("end", collected => {
								if (collected.size === 0) reject("Aucune sélection effectuée ⏰");
							});
						});
						const groupe = findGroup(classe);

						connection.query('UPDATE users SET classe = ?, groupe =? WHERE id = ?', [classe, groupe, interaction.user.id], async function (error, results) {
							if (error) throw error;
							console.log(results);
							await interaction.editReply({ content: 'Votre classe a bien été modifiée.', flags: MessageFlags.Ephemeral });
						});
					}
				}
			})
			pool.releaseConnection(connection);
		})
	},
};