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
const { stripIndents } = require("common-tags");

module.exports = {
  name: "nowplaying",
  aliases: ["np", "now", "song", "track"],
  usage: "",
  description: "Displays what the bot is currently playing.",
  needperms: [],
  permissions: [],
  async execute(message, args, client) {
    const player = client.music.players.get(message.guild.id);

    if (!player || !player.queue[0]) {
      const embed = new RichEmbed().setDescription(
        "No track/s currently playing in this guild."
      );
      return message.channel.send(embed);
    }

    const loadembed = new RichEmbed().setDescription(
      `Fetching track information...`
    );

    message.channel.send(loadembed).then((me) => {
      const { title, author, duration, url, thumbnail } = player.queue[0];

      let embed = new RichEmbed();

      if (!player.queue[0].isStream) {
        try {
          let progress = "";

          for (
            var i = 0;
            i < Math.floor((player.position / duration) * 32);
            i++
          ) {
            progress += "═";
          }

          for (
            var i = 0;
            i < 32 - Math.ceil((player.position / duration) * 32 + 1);
            i++
          ) {
            if (i === 0) {
              progress += "◯";
            } else {
              progress += "∙";
            }
          }
          embed = new RichEmbed()
            .setAuthor(
              "Current Track Playing:",
              message.author.displayAvatarURL
            )
            .setThumbnail(thumbnail)
            .setDescription(
              stripIndents`${
                player.playing ? "▶️" : "⏸️"
              } **[${title}](${url})** \`${Utils.formatTime(
                duration,
                true
              )}\` by ${author}\n\n\`${Utils.formatTime(
                player.position,
                true
              )} ${progress} ${Utils.formatTime(duration, true)}\``
            );
        } catch (e) {
          embed = new RichEmbed()
            .setAuthor(
              "Current Track Playing:",
              message.author.displayAvatarURL
            )
            .setThumbnail(thumbnail)
            .setDescription(
              stripIndents`${
                player.playing ? "▶️" : "⏸️"
              } **[${title}](${url})** \`${Utils.formatTime(
                duration,
                true
              )}\` by ${author}`
            );
        }
      } else {
        embed = new RichEmbed()
          .setAuthor("Current Track Playing:", message.author.displayAvatarURL)
          .setThumbnail(thumbnail)
          .setDescription(
            stripIndents`${
              player.playing ? "▶️" : "⏸️"
            } **[${title}](${url})** by ${author}\n\n\`🔴 LIVE\``
          );
      }

      return me.edit(embed);
    });
  },
};
