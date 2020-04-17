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
      player.textChannel.send("Queue has ended");
      return client.music.players.destroy(player.guild.id);
    })
    .on("trackStart", ({ textChannel }, { title, duration }) =>
      textChannel.send(
        `Now playing: **${title}** \`${Utils.formatTime(duration, true)}\``
      )
    );

  client.levels = new Map()
    .set("none", 0.0)
    .set("low", 0.1)
    .set("medium", 0.15)
    .set("high", 0.25);

  client.user.setActivity(
    `sick beats. | ${require("./config.json").settings.prefix}help`,
    { type: "LISTENING" }
  );

  console.log("Client Ready.");

  setInterval(() => {
    client.music.players.map((p) => {
      if (p.voiceChannel.members.filter((n) => !n.user.bot).size <= 0) {
        client.music.players.destroy(p.guild.id);
      }
    });
  }, 30000);
});

client.on("message", (message) => {
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

  if (
    !message.content.startsWith(require("./config.json").settings.prefix) ||
    message.author.bot ||
    message.channel.type !== "text"
  )
    return;

  const args = message.content
    .slice(require("./config.json").settings.prefix.length)
    .split(/ +/);
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
