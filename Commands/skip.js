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
  name: "skip",
  aliases: ["next", "s"],
  usage: "",
  description: "Skips the song currently playing.",
  needperms: [],
  permissions: [],
  async execute(message, args, client) {
    const { voiceChannel } = message.member;
    const player = client.music.players.get(message.guild.id);

    if (!player || !player.queue[0]) {
      const embed = new RichEmbed().setDescription(
        "No song/s currently playing in this guild."
      );
      return message.channel.send(embed);
    }
    if (!voiceChannel || voiceChannel.id !== player.voiceChannel.id) {
      const embed = new RichEmbed().setDescription(
        `You need to be ${
          !voiceChannel ? `in a voice channel` : `in the same voice channel`
        } to skip the track.`
      );
      return message.channel.send(embed);
    }

    if (
      player.voiceChannel.members.filter((n) => !n.user.bot).size >= 3 &&
      !message.member.hasPermission("MANAGE_CHANNELS")
    ) {
      let voteCount = 0;
      const voteembed = new RichEmbed()
        .setAuthor("Skip Track?", message.author.displayAvatarURL)
        .setDescription(
          `A vote is required to skip the track. **${
            player.voiceChannel.members.filter((n) => !n.user.bot).size - 1
          } votes required.**`
        )
        .setFooter("Vote closes within the next 30 secconds.");
      await message.channel.send(voteembed).then((m) => {
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
            player.stop();
            const embed = new RichEmbed().setDescription(
              "Skipped the current track!"
            );
            return message.channel.send(embed);
          }
        });
      });
    } else {
      player.stop();
      const embed = new RichEmbed().setDescription(
        "Skipped the current track!"
      );
      return message.channel.send(embed);
    }
  },
};
