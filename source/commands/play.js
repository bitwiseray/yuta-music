const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytsearch = require('yt-search');
const mcEmbed = require('../utils/mcEmb');
const streamPlayer = require('../utils/player');
const { PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('play songs!')
    .addStringOption(str => str.setName('song').setDescription('URL or the name of the song.').setRequired(true)),
  async execute(interaction, yuta) {
    if (!interaction.member.voice.channel) return interaction.reply('You need to be in a voice channel.');
    if (!interaction.member.voice.channel.permissionsFor(interaction.guild.members.me).has([PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak])) return interaction.reply('I don\'t have peermissions to connect/speak to your channel.');
    await interaction.deferReply();
    const guildQueue = yuta.queue.get(interaction.guild.id);
    const query = interaction.options.getString('song');
    let song = {};
    if (ytdl.validateURL(query)) {
      const songCache = await ytdl.getBasicInfo(query);
      song = { title: songCache.videoDetails.title, thumbnail: songCache.videoDetails.thumbnails[0].url, author: interaction.member, url: songCache.videoDetails.video_url, artist: songCache.ownerChannelName, length: songCache.lengthSeconds, date: songCache.uploadDate };
    } else {
      const songNameCache = await ytsearch(query);
      const songRes = (songNameCache.videos.length > 1) ? songNameCache.videos[0] : null;
      if (songRes) {
        song = { title: songRes.title, thumbnail: songRes.thumbnail, author: interaction.member, url: songRes.url, artist: songRes.author.name, length: songRes.duration.timestamp, date: songRes.ago };
      } else {
        return interaction.reply('I cannot find anything related to your query.');
      }
    }
    interaction.editReply({ embeds: [mcEmbed(song.thumbnail, song.title, `Added **${song.title}** to the queue`, yuta.user.displayAvatarURL())] });
    if (!guildQueue) {
      const queueConstructor = {
        targetChannel: interaction.member.voice.channel,
        textChannel: interaction.channel,
        connection: null,
        songs: [],
        player: null
      }
      queueConstructor.songs.push(song);
      yuta.queue.set(interaction.guild.id, queueConstructor);
      try {
        const connection = await joinVoiceChannel({
          channelId: interaction.member.voice.channel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator
        });
        queueConstructor.connection = connection;
        queueConstructor.player = createAudioPlayer({
          behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause
          }
        });
        streamPlayer(interaction.guild.id, queueConstructor.songs[0], yuta);
      } catch (error) {
        yuta.queue.delete(interaction.guild.id);
        interaction.channel.send(`Error connecting to the channel, \`${error}\``);
        throw error;
      }
    } else {
      guildQueue.songs.push(song);
    }
  }
}