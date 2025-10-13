const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('newinscription')
        .setDescription('Create a new inscription'),

    async execute(interaction) {
        const classe = [
            {
                label: "1A",
                description: "1A",
                value: "1A",
            },
            {
                label: "2A",
                description: "2A",
                value: "2A",
            }
        ]
        const menu = new StringSelectMenuBuilder()
            .setCustomId('select')
            .setPlaceholder('Sélectionnez votre classe...')
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(classe.map(c => new StringSelectMenuOptionBuilder(c)));
        const row = new ActionRowBuilder()
            .addComponents(menu);
        await interaction.reply({ content: 'Sélectionnez votre classe dans le menu ci-dessous :', components: [row] });
        const filter = i => i.customId === 'select' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect, time: 60000, max: 1 });
        collector.on('collect', async i => {
            await i.deferUpdate();
            const selected = i.values[0];
            await i.editReply({ content: `Vous avez sélectionné la classe : ${selected}`, components: [] });
            // Here you can handle the selected value, e.g., save it to a database
            console.log(`User selected: ${selected}`);
            text = `New inscription for class: ${selected
                }`;
        });
        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: 'Vous n\'avez pas sélectionné de classe à temps.', components: [] });
            }
        });
        await interaction.reply({ content: `Inscription créée : ${text}`, components: [] });
    }
};