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
const db = require("quick.db");

module.exports = {
  name: "prefix",
  aliases: ["setprefix", "sp", "setp"],
  usage: "",
  description: "Set the guild's prefix.",
  needperms: ["MANAGE_GUILD"],
  permissions: [],
  async execute(message, args, client) {
    db.set(`prefix_${message.guild.id}`, args.join(" ")).then((i) => {
      message.channel.send(`Successfully set prefix to ${i}`);
    });
  },
};
