const Discord	= require('discord.js'),
	  fs 		= require('fs'),
	  path		= require('path'),
	  util		= require('./utils/utils.js'),
	  log		= require('./utils/Logger.js'),
	  config   	= require('./config.json'),
	  stripIndent	= require('common-tags').stripIndent; 

const Bot = new Discord.Client();

Bot	
	.on('warn', (e) => log.warn(e))
	.on('error', (e) => log.warn(e))
	.on('disconnect', () => log.error(`#${Bot.shard.id} DISCONNECTED FROM DISCORD`, 'WARN'))
	.on('ready', () => {
		log.info(`#${Bot.shard.id} CONNECTED TO DISCORD`);
	})
	.login(config.token);

Bot.on('message', (message) => {
	if (message.author.bot) return;

	var obj = message.content.split(' ');
	var cmd = obj.shift().slice(config.prefix.length);
	var sub;

	var fp = './commands/' + cmd;

	let file;
	let args;

	if (message.content.includes('https://osu.ppy.sh/s/') || message.content.includes('https://osu.ppy.sh/b/')) {
		if (!require('./data/guildSettings.json')[message.guild.id]) return;
		var allowBeatmapDetect = require('./data/guildSettings.json')[message.guild.id].osuBeatmapDetect;
		if (!allowBeatmapDetect) return;
		var osuBeatmapCommand = require('./commands/osu/map.js');
		args = [];
		args[0] = message.content.match(/https:\/\/osu\.ppy\.sh\/(s|b)\/[\d]*/)[0];
		osuBeatmapCommand.run(Bot, message, args);
		return;
	};

	if (!message.content.startsWith(config.prefix)) return;

	try {

	// IF COMMAND
	fs.access(fp + ".js", fs.constants.F_OK, (err) => {
		if (Boolean(err)) return;
		file = require(fp);
		args = obj;
		if (file.serverOnly && message.channel.guild === undefined) { return message.channel.send(config.replySet.serverOnly) };
		if (file.ownerOnly && message.author.id != config.ownerID) { return message.channel.send(config.replySet.noPermsUser) };
		if (file.serverOwnerOnly && message.author.id != message.guild.ownerID) { return message.channel.send(config.replySet.noPermsUser) };
		log.logCommand(message.channel.guild === undefined ? null: message.channel.guild.name, message.author.username, message.content.slice(config.prefix.length), message.channel.name);
		file.run(Bot, message, args);
	});

	// IF SUBCOMMAND 
	fs.access(fp, fs.constants.F_OK, (err) => {
		if (Boolean(err)) return;
		sub = obj.shift();
		fs.access(fp + "/" + sub +  ".js", fs.constants.F_OK, (err) => {
			if (Boolean(err)) return;
			file = require(fp + '/' + sub + '.js');
			args = obj;
			if (file.serverOnly && message.channel.guild === undefined) { return message.channel.send(config.replySet.serverOnly) };
			if (file.ownerOnly && message.author.id != config.ownerID) { return message.channel.send(config.replySet.noPermsUser) };
			if (file.serverOwnerOnly && message.author.id != message.guild.ownerID) { return message.channel.send(config.replySet.noPermsUser) };
			log.logCommand(message.channel.guild === undefined ? null: message.channel.guild.name, message.author.username, message.content.slice(config.prefix.length), message.channel.name);
			file.run(Bot, message, args);
		});
	});

	}
	catch (err) {
		log.error(`Shard #${Bot.shard.id}\n${err.stack}`);
		message.channel.send(config.replySet.error);
	}
});

Bot.on('guildMemberAdd', (member) => {
	if (!require('./data/guildSettings.json')[member.guild.id]) return;
	var eventLogChannel = require('./data/guildSettings.json')[member.guild.id].guildEventLogChannel;
	if (!eventLogChannel) return;
	const log = new Discord.RichEmbed()
		.setAuthor(member.user.tag, member.user.displayAvatarURL)
		.setTimestamp(new Date())
		.setColor([65, 163, 244])
		.setFooter('User Joined')
	member.guild.channels.find('id', eventLogChannel).send({embed: log});
});

Bot.on('guildMemberRemove', (member) => {
	if (!require('./data/guildSettings.json')[member.guild.id]) return;
	var eventLogChannel = require('./data/guildSettings.json')[member.guild.id].guildEventLogChannel;
	if (!eventLogChannel) return;
	const log = new Discord.RichEmbed()
		.setAuthor(member.user.tag, member.user.displayAvatarURL)
		.setTimestamp(new Date())
		.setColor([244, 66, 66])
		.setFooter('User Left')
	member.guild.channels.find('id', eventLogChannel).send({embed: log});
});

Bot.on('messageReactionAdd', (react, user) => {
	if (!require('./data/guildSettings.json')[react.message.guild.id]) return;
	var guildStarredMessageChannel = require('./data/guildSettings.json')[react.message.guild.id].guildStarredMessageChannel;
	if (!guildStarredMessageChannel) return;
	if (!react.message.guild.members.find('id', user.id).hasPermission('MANAGE_MESSAGES')) return;
	if (react.emoji.name != '\u2B50') return;
	const pin = new Discord.RichEmbed()
		.setAuthor(react.message.member.user.tag, react.message.member.user.displayAvatarURL)
		.setTimestamp(new Date())
		.setDescription(react.message.content)
		.setColor([255, 221, 8])
		.setFooter(`\u2B50 by ${user.username}`);
	var a = react.message.attachments.first();
	if (a && a.height && a.width) {pin.setImage(a.url)};
	if (a && a.height == undefined && a.width == undefined) {pin.addField('File', `[${a.filename}](${a.url})`)};
	react.message.guild.channels.find('id', guildStarredMessageChannel).send({embed: pin});
});