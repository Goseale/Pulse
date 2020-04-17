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
const { Utils } = require("erela.js");

module.exports = {
  name: "queue",
  aliases: ["q", "songlist"],
  usage: "",
  description: "Displays what the current queue is.",
  needperms: [],
  permissions: [],
  async execute(message, args, client) {
    const { voiceChannel } = message.member;
    const player = client.music.players.get(message.guild.id);

    if (!player)
      return message.channel.send(
        "No song/s currrently playing in this guild."
      );

    let index = 1;
    let string = "";
    if (player.queue[0])
      string += `__**Currently Playing**__\n${player.queue[0].title} - **Requested by ${player.queue[0].requester.username}**.\n`;
    if (player.queue[1])
      string += `__**Rest of queue:**__\n${player.queue
        .slice(1, 10)
        .map(
          (x) =>
            `**${index++}** ${x.title} - **Requested by ${
              x.requester.username
            }**.`
        )
        .join("\n")}`;

    const embed = new RichEmbed()
      .setAuthor(
        `Current Queue for ${message.guild.name}`,
        message.guild.iconURL
      )
      .setThumbnail(player.queue[0].setThumbnail)
      .setDescription(string);

    return message.channel.send(embed);
  },
};