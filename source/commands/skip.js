const { SlashCommandBuilder } = require('@discordjs/builders');
const streamPlayer = require('../utils/player');
const mcEmbed = require('../utils/mcEmb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('skip the current song.'),
    async execute(interaction, yuta) {
        if (!interaction.member.voice.channel) return interaction.reply('You need to be in a voice channel.');
        let songQueue = yuta.queue.get(interaction.guild.id);
        interaction.reply({ embeds: [mcEmbed(song.thumbnail, song.title, `Skipped **${song.title}** to the queue`, yuta.user.displayAvatarURL())] });
        songQueue.songs.shift();
        streamPlayer(interaction.guild.id, songQueue.songs[0], yuta);
    },
};