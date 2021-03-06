const util      = require('../../utils/utils.js'),
      list      = require('../../data/link.json');

module.exports = {
    help: 'Link Discord to a Deresute ID. Leave <game id> blank to clear',
    usage: '<game id>',
    serverOnly: true,
    run: (client, msg, args) => {
        var m = msg.author;
        var u = args[0];
        if (u === undefined) {
            if (!list[msg.guild.id]) { return };
            if (!list[msg.guild.id][m.id]) { return };
            delete list[msg.guild.id][m.id].deresute;
            util.SaveFile('./data/link.json', list);
            msg.channel.send(`\uD83D\uDD17 \u276f  ${msg.guild.member(m).displayName} is now unlinked to Deresute.`);
            return;
        }
        if (!list[msg.guild.id]) { list[msg.guild.id] = {} };
        if (!list[msg.guild.id][m.id]) { list[msg.guild.id][m.id] = {} };
        if (("osu" in list[msg.guild.id][m.id])) { return msg.channel.send('\u26A0 \u276f  This user is already linked to Deresute.') };
        list[msg.guild.id][m.id].deresute = u;
        msg.channel.send(`\uD83D\uDD17 \u276f  ${msg.guild.member(m).displayName} is now linked to Deresute.`);
        util.SaveFile('./data/link.json', list);
    }
}