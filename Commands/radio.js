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
  name: "radio",
  aliases: ["playradio", "ra", "station"],
  usage: "",
  description: "Choose a radio station to add to the song queue.",
  needperms: ["CONNECT", "SPEAK"],
  permissions: [],
  execute(message, args, client) {
    const { voiceChannel } = message.member;

    if (!voiceChannel) {
      const embed = new RichEmbed().setDescription(
        "You need to be in a voice channel to play a radio station."
      );
      return message.channel.send(embed);
    }

    const player = client.music.players.spawn({
      guild: message.guild,
      textChannel: message.channel,
      voiceChannel,
      selfDeaf: true,
    });

    if (voiceChannel.id !== player.voiceChannel.id) {
      const embed = new RichEmbed().setDescription(
        "You need to be in the same voice channel to play a radio station."
      );
      return message.channel.send(embed);
    }

    const embed = new RichEmbed()
      .setAuthor("Station Selection.", message.author.displayAvatarURL)
      .setDescription(
        `Available Radio Stations:\n\`\`\`${require("../config.json")
          .radio.map((m) => m.name)
          .join(", ")}\`\`\``
      )
      .setFooter(
        "Your response time closes within the next 30 secconds. Type 'cancel' to cancel the selection"
      );

    message.channel.send(embed).then((m) => {
      const collector = message.channel.createMessageCollector(
        (me) => {
          return (
            me.author.id === message.author.id &&
            new RegExp(
              `^(${require("../config.json")
                .radio.map((m) => m.name.toLowerCase())
                .join("|")}|cancel)$`,
              "i"
            ).test(me.content.toLowerCase())
          );
        },
        {
          time: 30000,
          filter: (me) =>
            me.author.id === message.author.id &&
            new RegExp(
              `^(${require("../config.json")
                .radio.map((m) => m.name.toLowerCase())
                .join("|")}|cancel)$`,
              "i"
            ).test(me.content.toLowerCase()),
        }
      );

      collector.on("collect", (me) => {
        if (/cancel/i.test(me.content)) return collector.stop("cancelled");

        collector.stop("success");

        if (
          player.voiceChannel.members.filter((n) => !n.user.bot).size >= 3 &&
          !message.member.hasPermission("MANAGE_CHANNELS")
        ) {
          let voteCount = 0;
          const voteembed = new RichEmbed()
            .setAuthor("Add Station?", message.author.displayAvatarURL)
            .setDescription(
              `A vote is required to add a station. **${
                player.voiceChannel.members.filter((n) => !n.user.bot).size - 1
              } votes required.**`
            )
            .setFooter("Vote closes within the next 30 secconds.");
          message.channel.send(voteembed).then((m) => {
            m.react("✅");

            const filter = (reaction, user) =>
              reaction.emoji.name === "✅" &&
              Array.from(
                player.voiceChannel.members
                  .filter((n) => !n.user.bot)
                  .map((m) => m.id)
              ).includes(user.id);
            const collector = m.createReactionCollector(filter, {
              time: 30000,
            });

            collector.on("collect", () => {
              voteCount++;
              if (
                voteCount >=
                player.voiceChannel.members.filter((n) => !n.user.bot).size - 1
              )
                return collector.stop("success");
            });
            collector.on("remove", () => {
              voteCount--;
            });
            collector.on("end", (_, reason) => {
              if (reason == "time") {
                const embed = new RichEmbed().setDescription("Vote failed.");
                return message.channel.send(embed);
              } else {
                const loadembed = new RichEmbed().setDescription(
                  "Loading Track..."
                );

                m.edit(loadembed);
                client.music
                  .search(
                    require("../config.json").radio.find(
                      (station) =>
                        station.name &&
                        station.name.toLowerCase() === me.content.toLowerCase()
                    ).url,
                    message.author
                  )
                  .then(async (res) => {
                    player.queue.add(res.tracks[0]);
                    const embedtrack = new RichEmbed().setTitle(
                      `**Enqueuing ${res.tracks[0].title}**`
                    );
                    m.edit(embedtrack);
                    if (!player.playing) player.play();
                  })
                  .catch((err) => {
                    const embed = new RichEmbed().setDescription(err.message);
                    m.send(embed);
                    if (!player.playing) player.destroy();
                  });
              }
            });
          });
        } else {
          const loadembed = new RichEmbed().setDescription("Loading Track...");

          m.edit(loadembed);
          client.music
            .search(
              require("../config.json").radio.find(
                (station) =>
                  station.name &&
                  station.name.toLowerCase() === me.content.toLowerCase()
              ).url,
              message.author
            )
            .then(async (res) => {
              player.queue.add(res.tracks[0]);
              const embedtrack = new RichEmbed().setTitle(
                `**Enqueuing ${res.tracks[0].title}**`
              );
              m.edit(embedtrack);
              if (!player.playing) player.play();
            })
            .catch((err) => {
              const embed = new RichEmbed().setDescription(err.message);
              m.send(embed);
              if (!player.playing) player.destroy();
            });
        }
      });
      collector.on("end", (_, reason) => {
        if (["time", "cancelled"].includes(reason)) {
          const embed = new RichEmbed().setDescription("Cancelled selection.");
          return m.edit(embed);
        }
      });
    });
  },
};
