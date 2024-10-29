const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('inscription')
        .setDescription('Pour s\'inscrire à Couch Gaming.'),
    async execute(interaction) {
        // Create the modal
        const modal = new ModalBuilder()
            .setCustomId('inscription')
            .setTitle('Inscription à Couch Gaming');
            // Add components to modal
            // Create the text input components
            const firstname = new TextInputBuilder()
            .setRequired(true)
            .setCustomId('firstname')
            .setMaxLength(50)
            // The label is the prompt the user sees for this input
            .setLabel("Quel est votre prénom ?")
            // Short means only a single line of text
            .setStyle(TextInputStyle.Short);
        const lastname = new TextInputBuilder()
            .setRequired(true)
            .setCustomId('lastname')
            .setMaxLength(50)
            // The label is the prompt the user sees for this input
            .setLabel(" Quel est votre nom ?")
            // Short means only a single line of text
            .setStyle(TextInputStyle.Short);
        const classe = new TextInputBuilder()
            .setRequired(true)
            .setCustomId('classe')
            .setLabel(" Quelle est votre classe ?")
            // Paragraph means multiple lines of text.
            // .setStyle(TextInputStyle.Paragraph);
            .setStyle(TextInputStyle.Short)
            .setMinLength(2)
            .setMaxLength(7)
            .setPlaceholder(`
Exemple : 4MOC, 2A, 1I, etc.
`);

        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new ActionRowBuilder().addComponents(firstname);
        const secondActionRow = new ActionRowBuilder().addComponents(lastname);
        const thirdActionRow = new ActionRowBuilder().addComponents(classe);

        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);
    }

};