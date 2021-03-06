//
// Copyright [2020] [Pulse]
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const { ErelaClient, Utils } = require("erela.js");
const { nodes } = require("./config.json");
const DBL = require("dblapi.js");
const dbl = new DBL(require("./secret.json").dbltoken, client);

const prefixes = require("./models/prefixes.js");

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/prefixes");

const commandFiles = fs
  .readdirSync("./Commands")
  .filter((file) => file.endsWith(".js"));

const devFiles = fs
  .readdirSync("./DevCommands")
  .filter((file) => file.endsWith(".js"));

dbl.on("posted", () => {
  console.log("Server count posted!");
});

dbl.on("error", (e) => {
  console.log(`Oops! ${e}`);
});

client.on("ready", () => {
  client.commands = new Discord.Collection();

  client.devcommands = new Discord.Collection();

  for (const file of commandFiles) {
    delete require.cache[require.resolve(`./Commands/${file}`)];
    const command = require(`./Commands/${file}`);
    client.commands.set(command.name, command);
    console.log(`Loaded ./Commands/${file}`);
  }

  for (const file of devFiles) {
    delete require.cache[require.resolve(`./DevCommands/${file}`)];
    const command = require(`./DevCommands/${file}`);
    client.devcommands.set(command.name, command);
    console.log(`Loaded ./DevCommands/${file}`);
  }

  client.music = new ErelaClient(client, nodes)
    .on("nodeError", console.log)
    .on("nodeConnect", () => console.log("Successfully created a new node."))
    .on("queueEnd", (player) => {
      const embed = new Discord.RichEmbed().setDescription("Queue has ended");
      player.textChannel.send(embed);
      return client.music.players.destroy(player.guild.id);
    })
    .on("trackStart", ({ textChannel }, { title, duration, isStream }) => {
      const embed = new Discord.RichEmbed()
        .setTitle("Now Playing:")
        .setDescription(
          `**${title}**${
            !isStream ? ` \`${Utils.formatTime(duration, true)}\`` : ``
          }`
        );
      textChannel.send(embed);
    });

  client.levels = new Map()
    .set("none", 0.0)
    .set("low", 0.1)
    .set("medium", 0.15)
    .set("high", 0.25);

  client.user.setActivity(
    `sick beats. | ${require("./config.json").settings.prefix}help`,
    { type: "STREAMING", url: "https://twitch.tv/proximitynow/" }
  );

  console.log("Client Ready.");

  const readyembed = new Discord.RichEmbed().setDescription(
    `<:online33:701261102310359129> **Online**\nBot is back online!`
  );

  client.channels.get("700963901529128977").send(readyembed);

  setInterval(() => {
    client.music.players.map((p) => {
      if (p.voiceChannel.members.filter((n) => !n.user.bot).size <= 0) {
        const embed = new Discord.RichEmbed()
          .setTitle("**Disconnected**")
          .setDescription("I've left as there is nobody in my voice channel");
        p.textChannel.send(embed);
        client.music.players.destroy(p.guild.id);
      }
    });

    const embed = new Discord.RichEmbed()
      .setDescription(`**Pulse**\n*Created by Proximitynow and G3V*`)
      .addField(`Guilds`, `${client.guilds.size}`, true)
      .addField(`Users`, `${client.users.size}`, true)
      .addField(`Voice Connections`, `${client.music.players.size}`)
      .addField(`Uptime`, `${Utils.formatTime(client.uptime, true)}`)
      .addField(
        `Links`,
        `[Invite](https://discordapp.com/oauth2/authorize?client_id=700145482957324289&scope=bot&permissions=3145728) | [Vote](https://top.gg/bot/700145482957324289/vote) | [Support server](http://discord.gg/khFght9)`
      );

    client.channels
      .get("700963901897965648")
      .fetchMessages(1)
      .then((messages) => {
        messages.first().edit(embed);
      });
  }, 30000);
});

client.on("message", async (message) => {
  if (
    require("./config.json").settings.developers.includes(message.author.id) &&
    message.content.startsWith(require("./config.json").settings.devprefix)
  ) {
    const args = message.content
      .slice(require("./config.json").settings.devprefix.length)
      .split(/ +/);
    const command = args.shift().toLowerCase();
    const checkcmd =
      client.devcommands.get(command) ||
      client.devcommands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(command)
      );

    if (!checkcmd) return;

    if (!message.member.hasPermissions(checkcmd.permissions)) {
      const embed = new Discord.RichEmbed()
        .setColor(require("./config.json").colours.warning)
        .setTitle("Error")
        .setDescription(
          `You need the following permission(s) to execute this command:\n\n\`\`\`${checkcmd.permissions
            .filter((n) => !message.member.hasPermission(n))
            .join(", ")}\`\`\``
        )
        .setFooter(
          `Executed by ${message.author.tag}`,
          message.author.avatarURL
        )
        .setTimestamp(message.createdTimestamp);
      message.channel.send(embed);
      return;
    }

    if (
      !message.guild.members
        .get(client.user.id)
        .hasPermissions(checkcmd.needperms)
    ) {
      const embed = new Discord.RichEmbed()
        .setColor(require("./config.json").colours.warning)
        .setTitle("Error")
        .setDescription(
          `I need the following permission(s) to execute this command:\n\n\`\`\`${checkcmd.needperms
            .filter(
              (n) => !message.guild.members.get(client.user.id).hasPermission(n)
            )
            .join(", ")}\`\`\``
        )
        .setFooter(
          `Executed by ${message.author.tag}`,
          message.author.avatarURL
        )
        .setTimestamp(message.createdTimestamp);
      message.channel.send(embed);
      return;
    }

    try {
      checkcmd.execute(message, args, client);
    } catch (error) {
      console.error(error);
      const embed = new Discord.RichEmbed()
        .setColor(require("./config.json").colours.warning)
        .setTitle("Error")
        .setDescription(
          `There was an error trying to execute that command.\n\n\`\`\`js\n${error}\`\`\``
        )
        .setFooter(
          `Executed by ${message.author.tag}`,
          message.author.avatarURL
        )
        .setTimestamp(message.createdTimestamp);
      message.channel.send(embed);
    }
  }

  let prefix = require("./config.json").settings.prefix;

  prefixes.findOne({ guild: message.guild.id }, (err, nprefix) => {
    if (err) console.log(err);
    if (!nprefix) {
      const newPrefix = new prefixes({
        guild: message.guild.id,
        prefix: require("./config.json").settings.prefix,
      });
      newPrefix.save().catch((err) => console.log(err));
      prefix = require("./config.json").settings.prefix;
    } else {
      prefix = nprefix.prefix;
    }
  });

  if (
    !message.content.startsWith(prefix) ||
    message.author.bot ||
    message.channel.type !== "text"
  )
    return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();
  const checkcmd =
    client.commands.get(command) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(command));

  if (!checkcmd) return;

  if (!message.member.hasPermissions(checkcmd.permissions)) {
    const embed = new Discord.RichEmbed()
      .setColor(require("./config.json").colours.warning)
      .setTitle("Error")
      .setDescription(
        `You need the following permission(s) to execute this command:\n\n\`\`\`${checkcmd.permissions
          .filter((n) => !message.member.hasPermission(n))
          .join(", ")}\`\`\``
      )
      .setFooter(`Executed by ${message.author.tag}`, message.author.avatarURL)
      .setTimestamp(message.createdTimestamp);
    message.channel.send(embed);
    return;
  }

  if (
    !message.guild.members
      .get(client.user.id)
      .hasPermissions(checkcmd.needperms)
  ) {
    const embed = new Discord.RichEmbed()
      .setColor(require("./config.json").colours.warning)
      .setTitle("Error")
      .setDescription(
        `I need the following permission(s) to execute this command:\n\n\`\`\`${checkcmd.needperms
          .filter(
            (n) => !message.guild.members.get(client.user.id).hasPermission(n)
          )
          .join(", ")}\`\`\``
      )
      .setFooter(`Executed by ${message.author.tag}`, message.author.avatarURL)
      .setTimestamp(message.createdTimestamp);
    message.channel.send(embed);
    return;
  }

  try {
    checkcmd.execute(message, args, client);
  } catch (error) {
    console.error(error);
    const embed = new Discord.RichEmbed()
      .setColor(require("./config.json").colours.warning)
      .setTitle("Error")
      .setDescription(
        `There was an error trying to execute that command.\n\n\`\`\`js\n${error}\`\`\``
      )
      .setFooter(`Executed by ${message.author.tag}`, message.author.avatarURL)
      .setTimestamp(message.createdTimestamp);
    message.channel.send(embed);
  }
});

client.login(require("./secret.json").token);

// Pulse Support Server Stuff

client.on("guildMemberAdd", (member) => {
  if (member.guild.id === "700963900807708742") {
    const embed = new Discord.RichEmbed()
      .setColor(client.other)
      .setTitle(
        `Welcome to **Pulse Support Server**, ${member.user.username}#${member.user.discriminator}`
      )
      .setDescription(
        `Welcome to the server, <@!${member.user.id}>. \nIf you wish to invite the bot [You can click here](https://discordapp.com/oauth2/authorize?client_id=700145482957324289&scope=bot&permissions=3145728)\nTo use the bot type \`p!help\` inside <#700963901897965656>`
      )
      .setThumbnail(member.user.avatarURL);
    client.channels.get("700963901529128975").send(embed);
  }
});

client.on("guildMemberRemove", (member) => {
  if (member.guild.id === "700963900807708742") {
    const embed = new Discord.RichEmbed()
      .setColor(client.other)
      .setTitle("We are sad to see you go.")
      .setDescription(
        `<@!${member.user.id}> has left. We wish they enjoyed their time here.`
      )
      .setThumbnail(member.user.avatarURL)
      .setTimestamp(Date.now());
    client.channels.get("700963901529128975").send(embed);
  }
});
