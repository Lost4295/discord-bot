const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Renvoie une invitation pour le serveur.')
        .setDMPermission(false),
    async execute(interaction) {

        let invite = await interaction.channel.createInvite(
            {
                maxAge: 10 * 60 * 1000, // maximum time for the invite, in milliseconds
                maxUses: 1 // maximum times it can be used
            },
            `Requested with command by ${interaction.username}`
        )
            .catch(console.log);

        interaction.reply(invite ? `Voilà un lien d'invitation temporaire : ${invite}` : "Une erreur s'est produite lors de la création de l'invitation.");
    }
}