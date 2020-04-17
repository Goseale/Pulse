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
  name: "repeat",
  aliases: ["r", "loop"],
  usage: "<type> [on/off]",
  description:
    "Makes the bot repeat/stop repeating the music currently playing.",
  needperms: [],
  permissions: [],
  async execute(message, args, client) {
    const { voiceChannel } = message.member;
    const player = client.music.players.get(message.guild.id);

    if (!player)
      return message.channel.send(
        "No song/s currrently playing in this guild."
      );
    if (!voiceChannel || voiceChannel.id !== player.voiceChannel.id)
      return message.channel.send(
        "You need to be in a voice channel to repeat music."
      );
    if (!args[0] || args[0].toLowerCase() != "track" && args[0].toLowerCase() != "queue")
      return message.channel.send(
        "Please specify either `track` or `queue` to get repeated."
      );

    if (args[1]) result = args[1] == "on";

    if (args[0].toLowerCase() == "track") {
      if (!args[1]) {
        player.trackRepeat = !player.trackRepeat;
      } else {
        player.trackRepeat = result;
      }
    } else {
      if (!args[1]) {
        player.queueRepeat = !player.trackRepeat;
      } else {
        player.queueRepeat = result;
      }
    }

    return message.channel.send(
      `Player is now ${
        args[0].toLowerCase() == "track"
          ? `${player.trackRepeat ? `repeating` : `not repeating`}`
          : `${player.queueRepeat ? `repeating` : `not repeating`}`
      } the ${args[0].toLowerCase()}.`
    );
  },
};
