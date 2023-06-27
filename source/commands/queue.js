const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('list all the songs in the current queue'),
    async execute(interaction, yuta) {
        if (!yuta.queue.has(interaction.guild.id)) return interaction.reply('No queue is assigned yet. Play some music using </play:1049229882988695552>!');
        const queue = yuta.queue.get(interaction.guild.id);
        const songs = queue.songs;
        let list = songs.map((song, index) => `\`${index + 1}.\` **${song.title}** requested by ${song.author}`).join('\n');
        let totalLength = songs.reduce((sum, song) => sum + song.timestamp, 0);
        function formatTime(time) {
            let hours = Math.floor(time / 3600);
            let minutes = Math.floor((time % 3600) / 60);
            let seconds = Math.floor(time % 60);
            let output = '';
            if (hours > 0) output += `${hours}:${minutes < 10 ? "0" : ""} hours `;
            output += `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
            return output;
        }
        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Yuta Music', iconURL: yuta.user.displayAvatarURL() })
            .setThumbnail(songs[0].thumbnail)
            .setColor('LuminousVividPink')
            .setTitle('Server Queue')
            .setDescription(`${songs.length} songs • ${formatTime(totalLength)}m\n\n${list}`)
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
        interaction.reply({ embeds: [embed] });
    },
};