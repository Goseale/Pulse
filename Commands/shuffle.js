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
  name: "shuffle",
  aliases: ["mix"],
  usage: "",
  description: "Shuffles the queue.",
  needperms: [],
  permissions: [],
  async execute(message, args, client) {
    const { voiceChannel } = message.member;
    const player = client.music.players.get(message.guild.id);

    if (!player)
      return message.channel.send(
        "No song/s currrently playing in this guild."
      );
    if (!voiceChannel || voiceChannel.id !== player.voiceChannel.id) {
      const embed = new RichEmbed().setDescription(
        "You need to be in a voice channel to shuffle music."
      );
      return message.channel.send(embed);
    }

    player.queue.shuffle();
    const embed = new RichEmbed().setDescription("The queue is now shuffled.");
    return message.channel.send(embed);
  },
};
