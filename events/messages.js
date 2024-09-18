const { Events, ThreadAutoArchiveDuration } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(interaction) {
        console.log(`${interaction.author.tag} in #${interaction.channel.name} sent: ${interaction.content}`);
        if (interaction.author.bot) return;
        let test = interaction.content.toLowerCase();
        const channel = interaction.client.channels.cache.get(interaction.channelId);
        if (channel.id === '1283838245419094050' && test.includes('?') && test.length > 10) {
            const message = channel.messages.cache.get(interaction.id);
            const thread = await message.startThread({
                name: 'Réponses à la question de ' + interaction.author.username + ' : ' + test.substring(0, 50) + (test.length > 50 ? '...' : ''),
                autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
                reason: 'Réponses à la question de ' + interaction.author.username,
            });
            console.log(`Created thread: ${thread.name}`);
        }
    },
};