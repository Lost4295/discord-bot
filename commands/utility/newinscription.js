const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("newinscription")
        .setDescription("Assistant d'inscription interactif Couch Gaming"),

    async execute(interaction) {
        const user = interaction.user;
        const channel = interaction.channel;

        await interaction.reply({
            content: `👋 Salut ${user.username} ! On va faire ton inscription étape par étape.`,
            flags: MessageFlags.Ephemeral,
        });

        // Fonction utilitaire pour poser une question texte et supprimer la réponse après
        async function askQuestion(question, timeout = 60_000) {
            const questionMessage = await channel.send({ content: question,
            flags: MessageFlags.Ephemeral,
             });

            return new Promise((resolve, reject) => {
                const collector = channel.createMessageCollector({
                    filter: m => m.author.id === user.id,
                    time: timeout,
                    max: 1,
                });

                collector.on("collect", async msg => {
                    const response = msg.content.trim();
                    // 🧹 Supprimer la réponse utilisateur + la question
                    await Promise.allSettled([msg.delete(), questionMessage.delete()]);
                    resolve(response);
                });

                collector.on("end", collected => {
                    if (collected.size === 0) {
                        questionMessage.delete().catch(() => { });
                        reject("Temps écoulé ⏰");
                    }
                });
            });
        }

        try {
            // Étape 1 — prénom
            const prenom = await askQuestion("➡️ Quel est ton **prénom** ?");
            await channel.send({ content: `✅ Bonjour **${prenom}** !`, flags: MessageFlags.Ephemeral });

            // Étape 2 — nom
            const nom = await askQuestion("➡️ Et ton **nom de famille** ?");
            await channel.send({ content: `Parfait, **${prenom} ${nom}**, enchanté 😄`, flags: MessageFlags.Ephemeral });

            // Étape 3 — classe via menu déroulant
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

            const classMessage = await channel.send({
                content: "➡️ Maintenant, choisis ta **classe** :",
                components: [row],
                flags: MessageFlags.Ephemeral,
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
                        flags: MessageFlags.Ephemeral,
                    });

                    resolve(choice);
                });
                selectCollector.on("end", collected => {
                    if (collected.size === 0) reject("Aucune sélection effectuée ⏰");
                });
            });

            // Étape 4 — confirmation finale
            const confirmRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("confirm_yes")
                    .setLabel("✅ Confirmer")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("confirm_no")
                    .setLabel("❌ Annuler")
                    .setStyle(ButtonStyle.Danger)
            );

            await channel.send({
                content: `📝 **Récapitulatif :**  
- Prénom : ${prenom}  
- Nom : ${nom}  
- Classe : ${classe}  
  
Souhaites-tu confirmer ton inscription ?`,
                components: [confirmRow],
                flags: MessageFlags.Ephemeral,
            });

            const buttonCollector = channel.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60_000,
                max: 1,
                filter: i => i.user.id === user.id,
            });

            buttonCollector.on("collect", async i => {
                if (i.customId === "confirm_yes") {
                    await i.update({
                        content: `🎉 Inscription confirmée pour **${prenom} ${nom}** en **${classe}** ! Bienvenue 👑`,
                        components: [],
                        flags: MessageFlags.Ephemeral,
                    });
                    console.log(`✅ ${prenom} ${nom} inscrit en ${classe}`);
                } else {
                    await i.update({
                        content: "❌ Inscription annulée.",
                        components: [],
                        flags: MessageFlags.Ephemeral,
                    });
                    console.log(`❌ ${user.username} a annulé son inscription.`);
                }
            });

            buttonCollector.on("end", collected => {
                if (collected.size === 0) {
                    channel.send("⏰ Aucun choix effectué. Inscription expirée.");
                }
            });
        } catch (err) {
            await channel.send(`❌ ${err}\nCommande annulée.`
            );
        }
    },
};
