const { Events } = require('discord.js');
const cron = require('cron');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		let scheduledMessage = new cron.CronJob('00 00 14yh * * *', () => {
			// '00 30 10 * * *' = At 10:30:00am every day
			// This runs every day at 10:30:00, you can do anything you want
			// Specifing your guild (server) and your channel
			   const channel = client.channels.cache.get('1262692453358501919');
			   channel.send('You message');
			  });
				  
			  // When you want to start it, use:
			  scheduledMessage.start()
	},
};