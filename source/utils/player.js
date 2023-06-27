const { createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const mcEmbed = require('./mcEmb');

async function streamPlayer(guildId, songStream, yuta) {
  var songQueue = yuta.queue.get(guildId);
  if (!songStream) {
    songQueue.connection.disconnect();
    yuta.queue.delete(guildId);
    songQueue.textChannel.send('No more songs to play');
    return;
  }
  const streamCache = ytdl(songStream.url, {
    filter: 'audioonly',
    highWaterMark: 1 << 25,
    quality: 'highestaudio',
    dlChunkSize: 0
  });

  const stream = createAudioResource(streamCache);
  const player = songQueue.player;
  player.play(stream);
  if (!songQueue.connection.subscribe(player)) {
    songQueue.connection.subscribe(player);
  }

  player.on(AudioPlayerStatus.Idle, (oldState, newState) => {
    if (player.subscribers.length === 0) {
      songQueue.connection.disconnect();
      songQueue.textChannel.send('No one is listening, leaving the vc.');
    } else {
      songQueue.songs.shift();
      streamPlayer(guildId, songQueue.songs[0], yuta);
    }
  });

  player.on('error', (error) => {
    songQueue.textChannel.send(`Error playing **${songStream.title}**: ${error.message}`);
    if (songQueue.songs.length > 1) {
      songQueue.songs.shift();
      streamPlayer(guildId, songQueue.songs[0], yuta);
    } else {
      songQueue.connection.disconnect();
      yuta.queue.delete(guildId);
    }
  });
  songQueue.textChannel.send({ embeds: [mcEmbed(songStream.thumbnail, songStream.title, `Now playing **${songStream.title}**\nRequested by ${songStream.author}`, yuta.user.displayAvatarURL())] });
}

module.exports = streamPlayer;