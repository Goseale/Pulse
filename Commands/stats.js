const { RichEmbed } = require("discord.js");
const humanizeDuration = require("humanize-duration");

module.exports = {
  name: "stats",
  aliases: ["statistics", "stat", "uptime"],
  usage: "",
  description: "Stops the current song playing and disconnects the bot.",
  needperms: ["SEND_MESSAGES"],
  permissions: [],
  execute(message, args, client) {
    const statsembed = new RichEmbed()
      .setColor(client.other)
      .setTitle("Chain Stats")
      .addField("Total Commands", `\`${client.commands.size}\``, true)
      .addField("Total Guilds", `\`${client.guilds.size}\``, true)
      .addField("Total Channels", `\`${client.channels.size}\``, true)
      .addField("Total Users", `\`${client.users.size}\``, true)
      .addField(
        "Voice Connections",
        `\`${client.guilds.filter((n) => n.voiceConnection).size}\``,
        true
      )
      .addField(
        "Uptime",
        `\`${humanizeDuration(client.uptime, {
          conjunction: " and ",
          serialComma: false,
          language: "en",
          units: ["d", "h", "m", "s"],
          round: true,
        })}\``
      )
      .setThumbnail(client.user.avatarURL)
      .setTimestamp(Date.now());

    message.channel.send(statsembed);
  },
};
