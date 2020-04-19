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

module.exports = {
  name: "info",
  aliases: ["invite", "vote", "links", "link", "inf"],
  usage: "",
  description: "Info and important links about Pulse.",
  needperms: [],
  permissions: [],
  execute(message, args, client) {
    const embed = new RichEmbed().setDescription(
      `**Pulse**\n*Created by Proximitynow and G3V*\n\n[Invite Link](https://discordapp.com/oauth2/authorize?client_id=700145482957324289&scope=bot&permissions=3145728)\n[Vote Link](https://top.gg/bot/700145482957324289/vote)\n[Support Server](https://discord.gg/khFght9)`
    );

    message.channel.send(embed);
  },
};
