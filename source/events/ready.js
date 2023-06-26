const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(yuta) {
    console.log(`Ready! logged has ${yuta.user.username}!`);
    let status = 'Music';
    const globalQueue = yuta.queue.values();
    const firstResult = globalQueue.next();
    if (!firstResult.done) {
      const firstQueue = firstResult.value;
      if (firstQueue) {
        if (firstQueue.songs[0]) {
          status = `Now listening to ${firstQueue.songs[0].title}`;
        }
      }
    }
    yuta.user.setPresence({
      activities: [{
        name: str,
        type: ActivityType.Listening
      }],
      status: 'online'
    });
  },
};
