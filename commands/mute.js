const fs 		= require('fs'),
      util      = require('../utils/utils.js'),
      config    = require('../config.json'),
      list      = require('../data/mute.json');

module.exports = {
    help: 'Toggle mute status of the user\'s text chat or voice chat.\nAdd a "-setup" flag to setup roles and permissions.',
    usage: '<User> "-setup"',
    serverOnly: true,
    run: (client, msg, args) => {
        var member    = msg.mentions.members.first();
        var flags = args.join(" ");
        if (!msg.guild.me.hasPermission("MANAGE_CHANNELS")) {msg.channel.send(config.replySet.noPermsBot); return};
        if (!msg.member.hasPermission("MANAGE_CHANNELS")) {msg.channel.send(config.replySet.noPermsUser); return};
        if (!msg.guild.me.hasPermission("MANAGE_ROLES")) {msg.channel.send(config.replySet.noPermsBot); return};
        if (!msg.member.hasPermission("MANAGE_ROLES")) {msg.channel.send(config.replySet.noPermsUser); return};
        /*
        if (!list[msg.guild.id]) {list[msg.guild.id] = [];}
        if (!list[msg.guild.id].includes(user.id)) {list[msg.guild.id].push(user.id);}
        else {
            var tar = list[msg.guild.id].indexOf(user.id);
            if (tar > -1) {list[msg.guild.id].splice(tar, 1)};
        };
        if (isVoice != 'voice') {
            if (!list[msg.guild.id].includes(user.id)) {
                msg.guild.channels.forEach(c => {
                    c.permissionOverwrites.find('id', user.id).delete();
                })
                msg.channel.send(`\uD83D\uDD09 ${user.toString()} is now unsilenced.`);
                util.SaveFile('./data/mute.json', list);
            } else {
                msg.guild.channels.forEach(c => {
                    c.overwritePermissions(user, {'SEND_MESSAGES': false});
                })
                msg.channel.send(`\uD83D\uDD07 ${user.toString()} is now silenced.`);
                util.SaveFile('./data/mute.json', list);
            }
        } else {
            if (!msg.guild.me.hasPermission("MUTE_MEMBERS")) {msg.channel.send(config.replySet.noPermsBot); return};
            if (member.serverMute) {
                member.setMute(false);
                msg.channel.send(`\uD83D\uDD09 ${user.toString()} is now unmuted.`);
            } else {
                member.setMute(true);
                msg.channel.send(`\uD83D\uDD07 ${user.toString()} is now muted.`);
            }
        }
        */
        if (flags.includes("-setup")) {
            if (msg.guild.roles.exists("name", "Muted")) {
                msg.channel.send('The server already has this role.');
                return;
            };
            msg.guild.createRole({
                name: "Muted",
                color: [0, 0, 0]
            }).then(role => {
                msg.guild.channels.forEach(chan => {
                    chan.overwritePermissions(role, {'SEND_MESSAGES': false});
                })
                msg.channel.send('Created **Muted** role.');
            });
            return;
        };

        if (member.id == client.user.id) {msg.channel.send('\uD83D\uDED1 You can\'t mute me.'); return};

        if (!msg.guild.roles.exists("name", "Muted")) {
            msg.channel.send('The server has no **Muted** role.');
            return;
        };

        if (Boolean(member) && !member.roles.exists("name", "Muted")) {
            member.addRole(msg.guild.roles.find("name", "Muted"));
            msg.channel.send(`\uD83D\uDD07 ${member.toString()} is now silenced.`);
        }
        else if (Boolean(member) && member.roles.exists("name", "Muted")) {
            member.removeRole(msg.guild.roles.find("name", "Muted"));
            msg.channel.send(`\uD83D\uDD09 ${member.toString()} is now unsilenced.`);
        }
        else {
            msg.channel.send('Specify a user to mute.');
            return;
        };
    }
}