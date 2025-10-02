//TODO : refaire

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription('Permet d\'envoyer un message à chaque membre pour vérifier leurs informations.')
		.setDMPermission(false),
	async execute(interaction) {
		const pool = require("../../db.js");
		pool.getConnection(async function (err, connection) {
			
		await interaction.reply("Cette commande ne fonctionne pas pour l'instant, mais elle le sera très vite ! Demandez à <@349983254373466114> pour avoir la réponse à votre demande.");
		return;
			await interaction.deferReply();
			let errors = [];
			connection.query('SELECT * from users order by points DESC', async function (error, resultats) {
				if (error) throw error;
				for (let eleve of resultats) {
					console.log(eleve);
					try {
						let message = 'Bonjour ! Un nouveau message de ma part, pour te donner tes points et vérfier quelques petites infos ! Alors, tu as '+eleve.points+' points.\nEt, tu es bien en :\n - ';
						const niveau = eleve.classe[0];
						switch (niveau) {
							case '5':
								message += 'cinquième année, ';
								break;
							case '4':
								message += 'quatrième année, ';
								break;
							case '3':
								message += 'troisième année, ';
								break;
							case '2':
								message += 'deuxième année, ';
								break;
							case '1':
								message += 'première année, ';
								break;
							default:
								message += '... Je sais pas, il faudra que tu le renseignes ';
								break;
						}
						message += '\n - ';
						const filière = eleve.classe.replace(/\d/g, '');
						switch (filière) {
							case 'A':
							case 'a':
								message += 'en Alternance (soit première ou deuxième année), ';
								break;
							case 'i':
							case 'I':
								message += 'en Initial (soit première ou deuxième année), ';
								break;
							case 'j':
							case 'J':
								message += 'dans la promotion Janvier,';
								break;
							case 'AL':
							case 'al':
								message += 'en Architecture des Logiciels, ';
								break;
							case 'MOC':
							case 'moc':
								message += 'en Mobile et Objets Connectés, ';
								break;
							case 'IABD':
							case 'iabd':
								message += 'en Intelligence Artificielle et Big Data, ';
								break;
							case 'IBC':
							case 'ibc':
								message += 'en Ingénierie de la Blockchain, ';
								break;
							case 'IW':
							case 'iw':
								message += 'en Ingénierie du Web, ';
								break;
							case 'RVJV':
							case 'rvjv':
								message += 'en Réalité Virtuelle et Jeux Vidéo, ';
								break;
							case 'SRC':
							case 'src':
								message += 'en Sécurité et Réseaux et Cloud Computing, ';
								break;
							case 'SI':
							case 'si':
								message += 'en Sécurité Informatique, ';
								break;
							case 'MCSI':
							case 'mcsi':
								message += 'en Management et Conseil en Systèmes d\'Information, ';
								break;
							default:
								message += '... Je sais pas, il faudra que tu le renseignes ';
								break;
						}
						message += '\n - ';
						const groupe = /^-?\d+$/.test(eleve.classe[eleve.classe.length - 1]) ? eleve.classe[eleve.classe.length - 1] : "... Je sais pas, il faudra que tu le renseignes ";
						message += 'dans le groupe ' + groupe + '. C\'est bien ça ? \n\n Si ce n\'est pas le cas (et même si ça l\'est), envoie un';
						message += ' message à <@375710602364190731> pour qu\'il puisse faire les modifications nécessaires. Merci !';
						message += '\n\nIl faut bien que tu lui envoies ta classe, ta filière et ton groupe, sous la forme suivante : 2A5, 5RVJV1, etc.';
						message += '\nPar exemple, si je suis en première année, en initial et dans le groupe 1, je lui enverrai 1I1.';
						message += '\nSi je suis en deuxième année, en rentrée de janvier, en Alternance et dans le groupe 6, je lui enverrai 2J6.';
						message += '\nSi je suis en cinquième année, en Sécurité Informatique et dans le groupe 1, je lui enverrai 5SI1.';
						message += '\n\nMerci de ta compréhension !';
						let guild = interaction.guild;
						console.log(message);
						let user = await guild.members.fetch(eleve.user_id);
						console.log(user);
						await user.send({content: message});
					} catch (error) {
						console.error(error);
						console.error('Could not send message to ' + eleve.pseudo);
						errors.push([eleve.pseudo, eleve.user_id]);
					}
					setTimeout(() => { return 1; }, 2000);
				}

				let errmess = errors.map((error) => {
					return error[0] + " (" + error[1] + ")";
				}).join(", ");

				await interaction.editReply({content: "Messages envoyés !! Mais pas à eux: " + errmess});

			})
			pool.releaseConnection(connection);
		});
	}
};