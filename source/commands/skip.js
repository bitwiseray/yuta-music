const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('skip the current song.'),
    async execute(interaction, yuta) {
        if (!interaction.member.voice.channel) return interaction.reply('You need to be in a voice channel.');
        let songQueue = yuta.queue.get(interaction.guild.id);
        songQueue.songs.shift();
        streamPlayer(guildId, songQueue.songs[0], yuta);
    },
};