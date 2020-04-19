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
  usage: "[station]",
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

    let check = null;

    if (args[0]) {
      check = require("../config.json").radio.find(
        (station) =>
          station.name && station.name.toLowerCase() === args[0].toLowerCase()
      );
    } else {
      const embed = new RichEmbed().setDescription(
        `Available Radio Stations:\n\`\`\`${require("../config.json")
          .radio.map((m) => m.name)
          .join(", ")}\`\`\``
      );
      return message.channel.send(embed);
    }

    if (!check) {
      const embed = new RichEmbed().setDescription(
        `Available Radio Stations:\n\`\`\`${require("../config.json")
          .radio.map((m) => m.name)
          .join(", ")}\`\`\``
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

    const loadembed = new RichEmbed().setDescription("Loading Track...");

    message.channel.send(loadembed).then((m) => {
      client.music
        .search(check.url, message.author)
        .then(async (res) => {
          player.queue.add(res.tracks[0]);
          const embedtrack = new RichEmbed().setTitle(
            `**Enqueuing ${res.tracks[0].title} \`${Utils.formatTime(
              res.tracks[0].duration,
              true
            )}\`**`
          );
          m.edit(embedtrack);
          if (!player.playing) player.play();
        })
        .catch((err) => {
          const embed = new RichEmbed().setDescription(err.message);
          m.send(embed);
          if (!player.playing) player.destroy();
        });
    });
  },
};
