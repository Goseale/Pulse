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

const { RichEmbed } = require("discord.js");

module.exports = {
  name: "help",
  aliases: ["h"],
  usage: "[command]",
  description: "Displays a list of commands for this bot.",
  needperms: [],
  permissions: [],
  execute(message, args, client) {
    if (!args[0]) {
      const embed = new RichEmbed().setDescription(
        "Commands:\n```asciidoc\n" +
          client.commands
            .map(
              (m) =>
                `== ${require("../config.json").settings.prefix + m.name}\n${
                  m.description
                }`
            )
            .join("\n") +
          "```"
      );

      message.author
        .send(embed)
        .then(() => {
          const successembed = new RichEmbed().setDescription(
            "Sent command list to your messages."
          );

          message.channel.send(successembed);
        })
        .catch((e) => {
          const errorembed = new RichEmbed()
            .setTitle("Help")
            .setDescription("Unable to message you.");

          message.channel.send(errorembed);
        });
    } else {
      const checkcmd =
        client.commands.get(args[0].toLowerCase()) ||
        client.commands.find(
          (cmd) => cmd.aliases && cmd.aliases.includes(args[0].toLowerCase())
        );

      if (checkcmd) {
        const embed = new RichEmbed()
          .setTitle(
            `${require("../config.json").settings.prefix}${checkcmd.name}`
          )
          .setDescription(`${checkcmd.description}`)
          .addField(
            "Usage:",
            `\`${checkcmd.usage ? checkcmd.usage : "None"}\``,
            true
          )
          .addField(
            "Aliases:",
            `\`${
              checkcmd.aliases.join(", ") ? checkcmd.aliases.join(", ") : "None"
            }\``,
            true
          )
          .addField(
            "Required Permissions:",
            `\`${
              checkcmd.permissions.join(", ")
                ? checkcmd.permissions.join(", ")
                : "None"
            }\``,
            true
          )
          .addField(
            "My Permissions:",
            `\`${
              checkcmd.needperms.join(", ")
                ? checkcmd.needperms.join(", ")
                : "None"
            }\``,
            true
          );

        message.channel.send(embed);
      } else {
        const embed = new RichEmbed().setDescription(
          "Unable to find command `" +
            require("../config.json").settings.prefix +
            args[0].toLowerCase() +
            "`."
        );

        message.channel.send(embed);
      }
    }
  },
};
