const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    ChannelType,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("newinscription")
        .setDescription("Assistant d'inscription interactif Couch Gaming"),

    async execute(interaction) {
        const user = interaction.user;
        const parentChannel = interaction.channel;

        // ✅ Crée un fil temporaire pour l'inscription
        const thread = await parentChannel.threads.create({
            name: `📝 inscription-${user.username}`,
            autoArchiveDuration: 60, // 1h max
            type: ChannelType.PrivateThread,
            reason: `Inscription de ${user.username}`,
        });

        await thread.members.add(user.id);

        await interaction.reply({
            content: `👋 Salut ${user.username} ! J’ai créé un fil privé pour ton inscription. Rejoins-le ici : <#${thread.id}>`,
            ephemeral: true,
        });

        await thread.send(`Bienvenue ${user}, on va faire ton inscription étape par étape 😄`);

        // Fonction utilitaire pour poser une question et supprimer les messages
        async function askQuestion(question, timeout = 60_000) {
            const questionMsg = await thread.send(question);
            return new Promise((resolve, reject) => {
                const collector = thread.createMessageCollector({
                    filter: m => m.author.id === user.id,
                    time: timeout,
                    max: 1,
                });

                collector.on("collect", async msg => {
                    const response = msg.content.trim();
                    await Promise.allSettled([msg.delete(), questionMsg.delete()]);
                    resolve(response);
                });

                collector.on("end", collected => {
                    if (collected.size === 0) {
                        questionMsg.delete().catch(() => { });
                        reject("Temps écoulé ⏰");
                    }
                });
            });
        }

        try {
            // Étape 1 — prénom
            const prenom = await askQuestion("➡️ Quel est ton **prénom** ?");
            await thread.send(`✅ Bonjour **${prenom}** !`);

            // Étape 2 — nom
            const nom = await askQuestion("➡️ Et ton **nom de famille** ?");
            await thread.send(`Parfait, **${prenom} ${nom}**, enchanté 😄`);

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

            await thread.send({
                content: "➡️ Maintenant, choisis ta **classe** :",
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
                        content: `✅ Classe sélectionnée : **${choice}**`,
                        components: [],
                    });
                    resolve(choice);
                });

                collector.on("end", collected => {
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

            await thread.send({
                content: `📝 **Récapitulatif :**  
- Prénom : ${prenom}  
- Nom : ${nom}  
- Classe : ${classe}  
  
Souhaites-tu confirmer ton inscription ?`,
                components: [confirmRow],
            });

            const buttonCollector = thread.createMessageComponentCollector({
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
                    });
                    console.log(`✅ ${prenom} ${nom} inscrit en ${classe}`);
                } else {
                    await i.update({
                        content: "❌ Inscription annulée.",
                        components: [],
                    });
                    console.log(`❌ ${user.username} a annulé son inscription.`);
                }

                // 🧹 Supprime le fil après 5 secondes
                setTimeout(() => {
                    thread.delete(`Fin de l'inscription de ${user.username}`).catch(() => { });
                }, 5000);
            });

            buttonCollector.on("end", collected => {
                if (collected.size === 0) {
                    thread.send("⏰ Aucun choix effectué. Inscription expirée.").then(() => {
                        setTimeout(() => thread.delete().catch(() => { }), 5000);
                    });
                }
            });
        } catch (err) {
            await thread.send(`❌ ${err}\nCommande annulée.`);
            setTimeout(() => thread.delete().catch(() => { }), 5000);
        }
    },
};
