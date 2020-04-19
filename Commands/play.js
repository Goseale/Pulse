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
  name: "play",
  aliases: ["p", "add", "a", "pplay"],
  usage: "<song name/link>",
  description:
    "Choose a song/playlist or search for a song from YouTube to add to the song queue.",
  needperms: ["CONNECT", "SPEAK"],
  permissions: [],
  execute(message, args, client) {
    const { voiceChannel } = message.member;
    if (!voiceChannel) {
      const embed = new RichEmbed().setDescription(
        "You need to be in a voice channel to play music."
      );
      return message.channel.send(embed);
    }

    if (!args[0]) {
      const embed = new RichEmbed().setDescription(
        "Please provide a song name or link to search."
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
        "You need to be in the same voice channel to play music."
      );
      return message.channel.send(embed);
    }

    const loadembed = new RichEmbed().setDescription("Loading Track...");

    message.channel.send(loadembed).then((m) => {
      client.music
        .search(args.join(" "), message.author)
        .then(async (res) => {
          switch (res.loadType) {
            case "TRACK_LOADED":
              player.queue.add(res.tracks[0]);
              const embedtrack = new RichEmbed().setTitle(
                `**Enqueuing ${res.tracks[0].title} \`${Utils.formatTime(
                  res.tracks[0].duration,
                  true
                )}\`**`
              );
              m.edit(embedtrack);
              if (!player.playing) player.play();
              break;
            case "SEARCH_RESULT":
              let index = 1;
              const tracks = res.tracks.slice(0, 5);
              const embedsearch = new RichEmbed()
                .setAuthor("Song Selection.", message.author.displayAvatarURL)
                .setDescription(
                  tracks.map((video) => `**${index++} -** ${video.title}`)
                )
                .setFooter(
                  "Your response time closes within the next 30 secconds. Type 'cancel' to cancel the selection"
                );

              await m.edit(embedsearch);

              const collector = message.channel.createMessageCollector(
                (me) => {
                  return (
                    me.author.id === message.author.id &&
                    new RegExp(`^([1-5]|cancel)$`, "i").test(me.content)
                  );
                },
                {
                  time: 30000,
                  filter: (me) =>
                    me.author.id === message.author.id &&
                    new RegExp(`^([1-5]|cancel)$`, "i").test(me.content),
                }
              );

              collector.on("collect", (me) => {
                if (/cancel/i.test(me.content))
                  return collector.stop("cancelled");
                const track = tracks[Number(me.content) - 1];
                player.queue.add(track);
                const embedcollect = new RichEmbed().setTitle(
                  `**Enqueuing ${track.title} \`${Utils.formatTime(
                    track.duration,
                    true
                  )}\`**`
                );
                m.edit(embedcollect);
                if (!player.playing) player.play();
                return collector.stop("success");
              });
              collector.on("end", (_, reason) => {
                if (["time", "cancelled"].includes(reason)) {
                  const embed = new RichEmbed().setDescription(
                    "Cancelled selection."
                  );
                  return m.edit(embed);
                }
              });
              break;

            case "PLAYLIST_LOADED":
              res.playlist.tracks.forEach((track) => player.queue.add(track));
              const duration = Utils.formatTime(
                res.playlist.tracks.reduce((acc, cur) => ({
                  duration: acc.duration + cur.duration,
                })).duration,
                true
              );
              const embedplaylist = new RichEmbed().setTitle(
                `**\`${res.playlist.tracks.length}\` \`${duration}\` tracks in playlist \`${res.playlist.info.name}\`**`
              );
              m.edit(embedplaylist);
              if (!player.playing) player.play();
              break;
          }
        })
        .catch((err) => {
          const embed = new RichEmbed().setDescription(err.message);
          m.send(embed);
          if (!player.playing) player.destroy();
        });
    });
  },
};
