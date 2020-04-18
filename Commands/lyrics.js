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
const fetch = require("node-fetch");

module.exports = {
  name: "lyrics",
  aliases: ["l", "words"],
  usage: "[query]",
  description: "Finds the requested lyrics.",
  needperms: ["SEND_MESSAGES"],
  permissions: [],
  execute(message, args, client) {
    const { voiceChannel } = message.member;
    const player = client.music.players.get(message.guild.id);

    if (!args[0] && !player) {
      if (!player.queue[0]) {
        const embed = new RichEmbed().setDescription(
          "No song/s currently playing in this guild."
        );
        return message.channel.send(embed);
      }
    }

    if (args[0]) {
      let search = args.join(" ");
    } else {
      let search = player.queue[0].title;
    }

    try {
      fetch(
        `https://api.ksoft.si/lyrics/search?q=${encodeURIComponent(search)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${require("../secret.json").ksoftapi}`,
          },
        }
      ).then((res) => {
        res.json().then((lyrics) => {
          if (lyrics.data[0].lyrics.length <= 3896) {
            const how_many_to_split_at = 1948;
            const song_parts = [];

            for (
              var i = 0, charsLength = lyrics.data[0].lyrics.length;
              i < charsLength;
              i += how_many_to_split_at
            ) {
              song_parts.push(
                lyrics.data[0].lyrics.substring(i, i + how_many_to_split_at)
              );
            }

            song_parts.forEach((a) => {
              const embed = new RichEmbed()
                .setFooter("Lyrics provided by KSoft")
                .setDescription(
                  `**${lyrics.data[0].name}**\n*${lyrics.data[0].artist}*\n\n${a}`
                );
              message.channel.send(embed);
            });
          } else {
            try {
              const how_many_to_split_at = 1948;
              const song_parts = [];

              for (
                var i = 0, charsLength = lyrics.data[0].lyrics.length;
                i < charsLength;
                i += how_many_to_split_at
              ) {
                song_parts.push(
                  lyrics.data[0].lyrics.substring(i, i + how_many_to_split_at)
                );
              }

              song_parts.forEach((a) => {
                const embed = new RichEmbed()
                  .setFooter("Lyrics provided by KSoft")
                  .setDescription(
                    `**${lyrics.data[0].name}**\n*${lyrics.data[0].artist}*\n\n${a}`
                  )
                  .setTimestamp(message.createdTimestamp);
                message.author.send(embed);
              });

              const notify = new RichEmbed().setDescription(
                "Sent lyrics to DMs"
              );
              message.channel.send(notify);
            } catch (e) {
              const unable = new RichEmbed().setDescription(
                `Unable to send lyrics to DMs`
              );

              message.channel.send(unable);
            }
          }
        });
      });
    } catch (e) {
      const embed = new RichEmbed().setDescription(
        "Unable to fetch lyrics.\n\n" + e
      );
      message.channel.send(embed);
    }
  },
};
