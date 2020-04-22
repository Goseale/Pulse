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
  name: "stats",
  aliases: ["stat", "status", "statistics", "botinfo", "botstats", "uptime"],
  usage: "",
  description: "Displays the current statistics of Pulse.",
  needperms: [],
  permissions: [],
  execute(message, args, client) {
    const embed = new RichEmbed()
      .setDescription(`**Pulse**\n*Created by Proximitynow and G3V*`)
      .addField(`Guilds`, `${client.guilds.size}`, true)
      .addField(`Users`, `${client.users.size}`, true)
      .addField(`Voice Connections`, `${client.music.players.size}`)
      .addField(`Uptime`, `${Utils.formatTime(client.uptime, true)}`)
      .addField(`Usage`, `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 10) / 10}%`, true)
      .addField(
        `Links`,
        `[Invite](https://discordapp.com/oauth2/authorize?client_id=700145482957324289&scope=bot&permissions=3145728) | [Vote](https://top.gg/bot/700145482957324289/vote) | [Support server](http://discord.gg/khFght9)`
      );

    message.channel.send(embed);
  },
};
