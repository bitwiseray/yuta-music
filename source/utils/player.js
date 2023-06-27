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
    filter: 'audioonly', // only stream audio
    highWaterMark: 1 << 25, // set the buffer size to 32 MB
    quality: 'highestaudio', // use the highest audio quality
    dlChunkSize: 0 // download the entire audio at once
  });  
  const stream = createAudioResource(streamCache);
  const player = songQueue.player;
  player.play(stream);
  if (!songQueue.connection.subscribe(player)) {
    songQueue.connection.subscribe(player);
  }

  player.on(AudioPlayerStatus.Playing, (oldState) => {
    if (oldState.status === AudioPlayerStatus.Idle) {
      // the player was idle before, meaning the previous song has ended
      songQueue.songs.shift(); // remove the previous song from the queue
      streamPlayer(guildId, songQueue.songs[0], yuta); // play the next song
    }
  });
  
  player.on(AudioPlayerStatus.Idle, (oldState, newState) => {
    if (player.subscribers.length === 0) {
      // the player has no subscribers, meaning no one is listening
      songQueue.connection.disconnect(); // disconnect from the voice channel
      songQueue.textChannel.send('No one is listening, leaving the vc.'); // send a message
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