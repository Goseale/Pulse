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
const prefixes = require("../models/prefixes.js");

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/prefixes");

module.exports = {
  name: "prefix",
  aliases: ["setprefix", "sp", "setp"],
  usage: "",
  description: "Set the guild's prefix.",
  needperms: ["MANAGE_GUILD"],
  permissions: [],
  async execute(message, args, client) {
    const newPrefix = new prefixes({
      guild: message.guild.id,
      prefix: args.join(" "),
    });
    newPrefix.save().catch((err) => console.log(err));
    prefix = require("./config.json").settings.prefix;
  },
};
