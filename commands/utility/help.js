const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Liste toutes les commandes disponibles.'),
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
		await interaction.reply(`Commandes disponibles sur ${interaction.guild.name}:
- **help** : Liste toutes les commandes disponibles. (cette commande !)

- **server** : Liste des informations sur le serveur.

- **user** : Liste des informations sur l'utilisateur.

- **ping** : Pong !

- **user** : Donne des informations sur l'utilisateur.

- **server** : Donne des informations sur le serveur.

- **invite** : Donne le lien pour inviter quelqu'un sur le serveur.

- **register** : 

- **connect** :

- **getpts** : 

- **leaderboard** :

- **settings** : 

- **dates** :

- **nextevent** :

- **newquestion** : Proposer une nouvelle question à ajouter à la base de données lors de la commande "connect".

- **clear** : Supprime un nombre de messages spécifié. (réservé aux modérateurs)

- **kick** : Expulse un utilisateur du serveur. (réservé aux modérateurs)

- **ban** : Bannit un utilisateur du serveur. (réservé aux modérateurs)

- **pingbdd** :

- **timeout** :

- **warn** :

- **checkquestions** :

            `);
	},
};