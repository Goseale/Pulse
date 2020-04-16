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

const commandFiles = fs
  .readdirSync("./Commands")
  .filter((file) => file.endsWith(".js"));

client.on("ready", () => {
  client.commands = new Discord.Collection();

  for (const file of commandFiles) {
    delete require.cache[require.resolve(`./Commands/${file}`)];
    const command = require(`./Commands/${file}`);
    client.commands.set(command.name, command);
    console.log(`Loaded ./Commands/${file}`);
  }

  console.log("Bot Ready.");
});

client.on("message", (message) => {
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
    !message.guild.members.get(client.user.id).hasPermissions(checkcmd.needperms)
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

client.login(process.env.BOT_TOKEN);
