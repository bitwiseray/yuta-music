const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(yuta) {
    console.log(`Ready! logged has ${yuta.user.username}!`);
    let status = `Tipsy by Wanuka`;
    yuta.user.setPresence({
      activities: [{
        name: status,
        type: ActivityType.Listening
      }],
      status: 'online'
    });
  },
};
