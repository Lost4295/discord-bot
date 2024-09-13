const { Events, PermissionsBitField } = require('discord.js');
const cron = require('cron');
const { PASS, USER } = require('../config.json');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		const mysql = require('mysql2');
		const connection = mysql.createConnection({
			host: '127.0.0.1',
			user: USER,
			password: PASS,
			database: 'bot'
		});
		connection.connect();
		let scheduledMessage = new cron.CronJob('00 00 14 * * *', () => {
			// '00 30 10 * * *' = At 10:30:00am every day
			// This runs every day at 10:30:00, you can do anything you want
			// Specifing your guild (server) and your channel
			const channel = client.channels.cache.get('1262692453358501919');
			channel.send('You message');
			connection.query('SELECT * from dates WHERE date = CURDATE()', async function (error, results, fields) {
				if (error) throw error;
				if (results.length > 0) {
					const channel = client.channels.cache.get('772516231952990208');
					channel.send("L'association est ouverte aujourd'hui !");
					channel.permissionOverwrites.set([
						{
							id: '1029327286475968563',
							allow: [PermissionsBitField.Flags.SendMessages],
						}]
					);
					setTimeout(() => {
						channel.permissionOverwrites.set([
							{
								id: '1029327286475968563',
								deny: [PermissionsBitField.Flags.SendMessages],
							}]
						);
						channel.send("L'association est PLUS ouverte aujourd'hui !");
					}, 21600000);
				}
			});
		});

		// When you want to start it, use:
		scheduledMessage.start()
	},
};