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
  name: "seek",
  aliases: [],
  usage: "<<minutes> [seconds]>",
  description: "Seeks to the position in the song.",
  needperms: [],
  permissions: [],
  async execute(message, args, client) {
    const { voiceChannel } = message.member;
    const player = client.music.players.get(message.guild.id);

    if (!player)
      return message.channel.send(
        "No song/s currrently playing in this guild."
      );
    if (!args[0])
      return message.channel.send(
        `Please specify where to seek into the song.`
      );
    if (!voiceChannel || voiceChannel.id !== player.voiceChannel.id)
      return message.channel.send(
        "You need to be in a voice channel to seek music."
      );
    if (!args[1]) {
      if (
        Number(args[0]) * 60000 < 0 ||
        Number(args[0]) * 60000 > player.queue[0].duration
      )
        return message.channel.send("Invalid timestamp.");

      player.seek(Number(args[0]) * 60000);
      return message.channel.send(
        `Successfully seeked to: ${Utils.formatTime(
          Number(args[0]) * 60000,
          true
        )}`
      );
    } else {
      if (
        Number(args[0]) * 60000 + Number(args[1]) * 1000 < 0 ||
        Number(args[0]) * 60000 + Number(args[1]) * 1000 >
          player.queue[0].duration
      )
        return message.channel.send("Invalid timestamp.");

      player.seek(Number(args[0]) * 60000 + Number(args[1]) * 1000);
      return message.channel.send(
        `Successfully seeked to: ${Utils.formatTime(
          Number(args[0]) * 60000 + Number(args[1]) * 1000,
          true
        )}`
      );
    }
  },
};
