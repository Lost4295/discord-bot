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
        .setName("inscription")
        .setDescription("Assistant d'inscription interactif Couch Gaming"),

    async execute(interaction) {
        const user = interaction.user;
        const parentChannel = interaction.channel;
        const pool = require("../../db.js");
        // Vérifie si l'utilisateur est déjà inscrit
        pool.getConnection(async function (err, connection) {
            if (err) throw err;

            connection.query('SELECT * FROM users WHERE id = ?', [user.id], function (error, results) {
                if (error) throw error;
                if (results.length > 0) {
                    interaction.reply({ content: `Tu es déjà inscrit, ${user.username} ! Si tu souhaites mettre à jour tes informations, lance /settings.`, ephemeral: true });
                    pool.releaseConnection(connection);
                    return;
                }
            })
            // ✅ Crée un fil temporaire pour l'inscription
            const thread = await parentChannel.threads.create({
                name: `📝 inscription-${user.username}`,
                autoArchiveDuration: 60, // 1h max
                type: ChannelType.PrivateThread,
                reason: `Inscription de ${user.username}`,
            });

            await thread.members.add(user.id);

            await interaction.reply({
                content: `Salut ${user.username} ! J’ai créé un fil privé pour ton inscription. Rejoins-le ici : <#${thread.id}>`,
                ephemeral: true,
            });

            await thread.send(`Bienvenue ${user}, on va faire ton inscription étape par étape.`);

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
            function addUserToDatabase({ prenom, nom, classe }) {
                const groupe = findGroup(classe);
						let fclasse;
						if (groupe){
							fclasse = classe.substring(0, classe.length - 1);
						}
                connection.query(
                    'INSERT INTO users (pseudo, id, prenom, nom, classe, groupe, date_inscr) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                    [user.username, user.id, prenom, nom, fclasse || classe, groupe],
                    function (error) {
                        if (error) {
                            throw new Error(error);
                        }
                        console.log(`Utilisateur ${prenom} ${nom} (${user.username}) ajouté à la base de données.`);

                    });
            }

    function findGroup(classe) {
        const groupMatch = classe.match(/^\d[A-Z]+/);
        if (groupMatch) {
            let regex = new RegExp(groupMatch[0], 'g');
            let res = classe.replace(regex, '');
            return res;
        }
        return null;
    }

            try {
                // Étape 1 — prénom
                const prenom = await askQuestion(" Quel est ton **prénom** ?");
                await thread.send(`Bonjour **${prenom}** !`);

                // Étape 2 — nom
                const nom = await askQuestion(" Et ton **nom de famille** ?");
                await thread.send(`Parfait, **${prenom} ${nom}**, enchanté !`);

                // Étape 3 — classe via menu déroulant
                const classes = [
                    { label: "1A1", description: "Première année Alternance Groupe 1", value: "1A1" },
                    { label: "1A2", description: "Première année Alternance Groupe 2", value: "1A2" },
                    { label: "1A3", description: "Première année Alternance Groupe 3", value: "1A3" },
                    { label: "1A4", description: "Première année Alternance Groupe 4", value: "1A4" },
                    { label: "1A5", description: "Première année Alternance Groupe 5", value: "1A5" },
                    { label: "1A6", description: "Première année Alternance Groupe 6", value: "1A6" },
                    { label: "1A7", description: "Première année Alternance Groupe 7", value: "1A7" },
                    { label: "1I1", description: "Première année Initial Groupe 1", value: "1I1" },
                    { label: "1I2", description: "Première année Initial Groupe 2", value: "1I2" },
                    { label: "2A1", description: "Deuxième année Alternance Groupe 1", value: "2A1" },
                    { label: "2A2", description: "Deuxième année Alternance Groupe 2", value: "2A2" },
                    { label: "2A3", description: "Deuxième année Alternance Groupe 3", value: "2A3" },
                    { label: "2A4", description: "Deuxième année Alternance Groupe 4", value: "2A4" },
                    { label: "2A5", description: "Deuxième année Alternance Groupe 5", value: "2A5" },
                    { label: "2I1", description: "Deuxième année Initial Groupe 1", value: "2I1" },
                    { label: "2I2", description: "Deuxième année Initial Groupe 2", value: "2I2" },
                    { label: "2MCSI", description: "Deuxième année MCSI", value: "2MCSI" },
                    { label: "3AL1", description: "Troisième année AL Groupe 1", value: "3AL1" },
                    { label: "3AL2", description: "Troisième année AL Groupe 2", value: "3AL2" },
                    { label: "3IABD1", description: "Troisième année IABD Groupe 1", value: "3IABD1" },
                    { label: "3IABD2", description: "Troisième année IABD Groupe 2", value: "3IABD2" },
                    { label: "3MOC", description: "Troisième année MOC", value: "3MOC" },
                    { label: "3IBC", description: "Troisième année IBC", value: "3IBC" },
                    { label: "3IW1", description: "Troisième année IW Groupe 1", value: "3IW1" },
                    { label: "3IW2", description: "Troisième année IW Groupe 2", value: "3IW2" },
                    { label: "3MCSI1", description: "Troisième année MCSI Groupe 1", value: "3MCSI1" },
                    { label: "3MCSI2", description: "Troisième année MCSI Groupe 2", value: "3MCSI2" },
                    { label: "3RVJV", description: "Troisième année RVJV", value: "3RVJV" },
                    { label: "3SI1", description: "Troisième année SI Groupe 1", value: "3SI1" },
                    { label: "3SI2", description: "Troisième année SI Groupe 2", value: "3SI2" },
                    { label: "3SI3", description: "Troisième année SI Groupe 3", value: "3SI3" },
                    { label: "3SI4", description: "Troisième année SI Groupe 4", value: "3SI4" },
                    { label: "3SI5", description: "Troisième année SI Groupe 5", value: "3SI5" },
                    { label: "3SRC1", description: "Troisième année SRC Groupe 1", value: "3SRC1" },
                    { label: "3SRC2", description: "Troisième année SRC Groupe 2", value: "3SRC2" },
                    { label: "3SRC3", description: "Troisième année SRC Groupe 3", value: "3SRC3" },
                    { label: "3SRC4", description: "Troisième année SRC Groupe 4", value: "3SRC4" },
                    { label: "3SRC5", description: "Troisième année SRC Groupe 5", value: "3SRC5" },
                    { label: "4AL1", description: "Quatrième année AL Groupe 1", value: "4AL1" },
                    { label: "4AL2", description: "Quatrième année AL Groupe 2", value: "4AL2" },
                    { label: "4IABD1", description: "Quatrième année IABD Groupe 1", value: "4IABD1" },
                    { label: "4IABD2", description: "Quatrième année IABD Groupe 2", value: "4IABD2" },
                    { label: "4MOC", description: "Quatrième année MOC", value: "4MOC" },
                    { label: "4IBC", description: "Quatrième année IBC", value: "4IBC" },
                    { label: "4IW1", description: "Quatrième année IW Groupe 1", value: "4IW1" },
                    { label: "4IW2", description: "Quatrième année IW Groupe 2", value: "4IW2" },
                    { label: "4IW3", description: "Quatrième année IW Groupe 3", value: "4IW3" },
                    { label: "4MCSI1", description: "Quatrième année MCSI Groupe 1", value: "4MCSI1" },
                    { label: "4MCSI2", description: "Quatrième année MCSI Groupe 2", value: "4MCSI2" },
                    { label: "4MCSI3", description: "Quatrième année MCSI Groupe 3", value: "4MCSI3" },
                    { label: "4MCSI4", description: "Quatrième année MCSI Groupe 4", value: "4MCSI4" },
                    { label: "4RVJV", description: "Quatrième année RVJV", value: "4RVJV" },
                    { label: "4SI1", description: "Quatrième année SI Groupe 1", value: "4SI1" },
                    { label: "4SI2", description: "Quatrième année SI Groupe 2", value: "4SI2" },
                    { label: "4SI3", description: "Quatrième année SI Groupe 3", value: "4SI3" },
                    { label: "4SI4", description: "Quatrième année SI Groupe 4", value: "4SI4" },
                    { label: "4SI5", description: "Quatrième année SI Groupe 5", value: "4SI5" },
                    { label: "4SRC1", description: "Quatrième année SRC Groupe 1", value: "4SRC1" },
                    { label: "4SRC2", description: "Quatrième année SRC Groupe 2", value: "4SRC2" },
                    { label: "4SRC3", description: "Quatrième année SRC Groupe 3", value: "4SRC3" },
                    { label: "4SRC4", description: "Quatrième année SRC Groupe 4", value: "4SRC4" },
                    { label: "4SRC5", description: "Quatrième année SRC Groupe 5", value: "4SRC5" },
                    { label: "5MOC", description: "Cinquième année MOC", value: "5MOC" },
                    { label: "5IBC", description: "Cinquième année IBC", value: "5IBC" },
                    { label: "5IW1", description: "Cinquième année IW Groupe 1", value: "5IW1" },
                    { label: "5IW2", description: "Cinquième année IW Groupe 2", value: "5IW2" },
                    { label: "5AL1", description: "Cinquième année AL Groupe 1", value: "5AL1" },
                    { label: "5AL2", description: "Cinquième année AL Groupe 2", value: "5AL2" },
                    { label: "5MCSI1", description: "Cinquième année MCSI Groupe 1", value: "5MCSI1" },
                    { label: "5MCSI2", description: "Cinquième année MCSI Groupe 2", value: "5MCSI2" },
                    { label: "5MCSI3", description: "Cinquième année MCSI Groupe 3", value: "5MCSI3" },
                    { label: "5IABD1", description: "Cinquième année IABD Groupe 1", value: "5IABD1" },
                    { label: "5IABD2", description: "Cinquième année IABD Groupe 2", value: "5IABD2" },
                    { label: "5RVJV", description: "Cinquième année RVJV", value: "5RVJV" },
                    { label: "5SI1", description: "Cinquième année SI Groupe 1", value: "5SI1" },
                    { label: "5SI2", description: "Cinquième année SI Groupe 2", value: "5SI2" },
                    { label: "5SI3", description: "Cinquième année SI Groupe 3", value: "5SI3" },
                    { label: "5SRC1", description: "Cinquième année SRC Groupe 1", value: "5SRC1" },
                    { label: "5SRC2", description: "Cinquième année SRC Groupe 2", value: "5SRC2" },
                    { label: "5SRC3", description: "Cinquième année SRC Groupe 3", value: "5SRC3" },
                    { label: "5SRC4", description: "Cinquième année SRC Groupe 4", value: "5SRC4" },
                ];
                function buildSelectMenu(id, label, options) {
                    return new StringSelectMenuBuilder()
                        .setCustomId(id)
                        .setPlaceholder(label)
                        .addOptions(options);
                }

                const selects = [
                    buildSelectMenu("select_1A", "Première année", classes.filter(c => c.value.startsWith("1"))),
                    buildSelectMenu("select_2A", "Deuxième année", classes.filter(c => c.value.startsWith("2"))),
                    buildSelectMenu("select_3A", "Troisième année", classes.filter(c => c.value.startsWith("3"))),
                    buildSelectMenu("select_4A", "Quatrième année", classes.filter(c => c.value.startsWith("4"))),
                    buildSelectMenu("select_5A", "Cinquième année", classes.filter(c => c.value.startsWith("5"))),
                ];
                const rows = selects.map(s => new ActionRowBuilder().addComponents(s));

                await thread.send({
                    content: "Maintenant, choisis ta **classe**, et fais bien attention ! Tu as le niveau, et le groupe (si tu ne le connais pas, c'est pas grave, tu pourras le modifier plus tard, du moment que l'année est correcte) :",
                    components: rows,
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
                            content: `🎉 Inscription confirmée pour **${prenom} ${nom}** en **${classe}** ! Bienvenue à Couch Gaming 👑`,
                            components: [],
                        });
                        console.log(`✅ ${prenom} ${nom} inscrit en ${classe}`);
                        await addUserToDatabase({ prenom, nom, classe });
                        console.log(`✅ ${prenom} ${nom} ajouté à la base de données.`);
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
            pool.releaseConnection(connection);
        });
    }
}
