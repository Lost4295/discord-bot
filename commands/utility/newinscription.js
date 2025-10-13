const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, SlashCommandBuilder, Emoji } = require('discord.js');


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
                emoji: "1️⃣"
            },
            {
                label: "2A",
                description: "2A",
                value: "2A",
                emoji: "2️⃣"
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
        const menu2 = new StringSelectMenuBuilder()
            .setCustomId('select2')
            .setPlaceholder('Sélectionnez votre classe...')
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(classe.map(c => new StringSelectMenuOptionBuilder(c)));
        const row2 = new ActionRowBuilder()
            .addComponents(menu2);

        await interaction.reply({ content: 'Sélectionnez votre classe dans le menu ci-dessous :', components: [row] });
        const filter = i => i.customId === 'select' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect, time: 60000, max: 1 });
        collector.on('collect', async i => {
            await i.deferUpdate();
            const selected = i.values[0];
            await i.editReply({ content: `Vous avez sélectionné la classe : ${selected}. Maintenant refaites le ?`, components: [row2] });
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
        
        const filter2 = i => i.customId === 'select2' && i.user.id === interaction.user.id;
        const collector2 = interaction.channel.createMessageComponentCollector({ filter2, componentType: ComponentType.StringSelect, time: 60000, max: 1 });
        collector2.on('collect', async i => {
            await i.deferUpdate();
            const selected = i.values[0];
            await i.editReply({ content: `Vous avez sélectionné la classe : ${selected}. Bravo !`, components: [] });
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
    }
};