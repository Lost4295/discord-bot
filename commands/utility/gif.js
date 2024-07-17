const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gif')
        .setDescription('Sends a random gif!')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('The gif category')
                .setRequired(true)
                .addChoices(
                    { name: 'Funny', value: 'gif_funny' },
                    { name: 'Meme', value: 'gif_meme' },
                    { name: 'Movie', value: 'gif_movie' },
                ))
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('An image that certifies the presence in distance learning.')),
    async execute(interaction) {
        const category = interaction.options.getString('category');
        const img = interaction.options.getAttachment('image');
        let url = '';
        switch (category) {
            case 'gif_funny':
                url = 'https://giphy.com/gifs/funny-lol-3o6Zt6MLC9Kv8nK3Ks';
                break;
            case 'gif_meme':
                url = 'https://giphy.com/gifs/meme-9J7tdYltWyXIY';
                break;
            case 'gif_movie':
                url = 'https://giphy.com/gifs/movie-film-3o6Zt7WfF6y5Zn8F4I';
                break;
        }
        console.log(img.url)
        await interaction.reply(url);
    }
};