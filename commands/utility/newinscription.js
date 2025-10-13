const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ComponentType,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("newinscription")
        .setDescription("Assistant d'inscription interactif Couch Gaming"),

    async execute(interaction) {
        const user = interaction.user;
        const channel = interaction.channel;

        // Étape 1 — salutation
        await interaction.reply({
            content: `👋 Salut ${user.username} ! On va faire ton inscription étape par étape.`,
            ephemeral: true,
        });

        // Fonction utilitaire pour poser une question texte et récupérer la réponse
        async function askQuestion(question, timeout = 60_000) {
            await channel.send({ content: question });
            return new Promise((resolve, reject) => {
                const collector = channel.createMessageCollector({
                    filter: m => m.author.id === user.id,
                    time: timeout,
                    max: 1,
                });
                collector.on("collect", msg => resolve(msg.content.trim()));
                collector.on("end", collected => {
                    if (collected.size === 0) reject("Temps écoulé ⏰");
                });
            });
        }

        try {
            // Étape 2 — prénom
            const prenom = await askQuestion("➡️ Quel est ton **prénom** ?");
            await channel.send(`✅ Super, bonjour **${prenom}** !`);

            // Étape 3 — nom
            const nom = await askQuestion("➡️ Et ton **nom de famille** ?");
            await channel.send(`Parfait, **${prenom} ${nom}**, enchanté 😄`);

            // Étape 4 — sélection de la classe
            const classes = [
                { label: "1A", description: "Première année", value: "1A", emoji: "1️⃣" },
                { label: "2A", description: "Deuxième année", value: "2A", emoji: "2️⃣" },
                { label: "4MOC", description: "Formation MOC", value: "4MOC", emoji: "4️⃣" },
            ];

            const select = new StringSelectMenuBuilder()
                .setCustomId("select_class")
                .setPlaceholder("Sélectionne ta classe")
                .addOptions(classes.map(c => new StringSelectMenuOptionBuilder(c)));

            const row = new ActionRowBuilder().addComponents(select);

            await channel.send({
                content: "➡️ Maintenant, choisis ta **classe** :",
                components: [row],
            });

            const selectCollector = channel.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60_000,
                max: 1,
                filter: i => i.user.id === user.id,
            });

            const classe = await new Promise((resolve, reject) => {
                selectCollector.on("collect", async i => {
                    const choice = i.values[0];
                    await i.update({
                        content: `✅ Classe sélectionnée : **${choice}**`,
                        components: [],
                    });
                    resolve(choice);
                });
                selectCollector.on("end", collected => {
                    if (collected.size === 0) reject("Aucune sélection effectuée ⏰");
                });
            });

            // Étape 5 — confirmation finale
            await channel.send(
                `🎉 Merci **${prenom} ${nom}** !\nTu es bien inscrit dans la classe **${classe}**.\nTon inscription est terminée ✅`
            );

            // (Optionnel) — tu pourrais ici sauvegarder en base de données
            // saveToDatabase({ userId: user.id, prenom, nom, classe });

        } catch (err) {
            await channel.send(`❌ ${err}\nCommande annulée.`);
        }
    },
};
