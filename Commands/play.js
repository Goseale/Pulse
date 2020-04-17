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
  usage: "",
  description:
    "Choose a song/playlist or search for a song from YouTube to add to the song queue.",
  needperms: [],
  permissions: [],
  execute(message, args, client) {
    const { voiceChannel } = message.member;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music"
      );

    const permissions = voiceChannel.permissionsFor(client.user);
    if (!permissions.has("CONNECT"))
      return message.channel.send(
        "I cannot connect to your voice channel, make sure I have permission to."
      );
    if (!permissions.has("SPEAK"))
      return message.channel.send(
        "I cannot speak in your voice channel, make sure I have permission to."
      );

    if (!args[0])
      return message.channel.send(
        "Please provide a song name or link to search."
      );

    const player = client.music.players.spawn({
      guild: message.guild,
      textChannel: message.channel,
      voiceChannel
    });

    client.music.search(args.join(" "), message.author).then(async res => {
      switch (res.loadType) {
        case "TRACK_LOADED":
          player.queue.add(res.tracks[0]);
          message.channel.send(
            `Enqueing \`${res.tracks[0].title}\` \`${Utils.formatTime(
              res.tracks[0].duration,
              true
            )}\``
          );
          if (!player.playing) player.play();
          break;
          case "SEARCH_RESULT":
              let index = 1;
              const tracks  = res.tracks.slice(0,5);
              const embed = new RichEmbed()
              .setAuthor("Song Selection.",message.author.displayAvatarURL)
              .setDescription(tracks.map(video => `**${index++} -** ${video.title}`))
              .setFooter("Your response time closes within the next 30 secconds. Type 'cancel' to cancel the selection");
              
              message.channel.send(embed);
              
                const collector = message.channel.createMessageCollector(m => {

                    return m.author.id === message.author.id && new RegExp('^([1-5|cancel])$',"i").test(m.content)

                }, {time: 30000,max: 1});

                collector.on("collect", m => {

                   if (/cancel/i.test(m.content)) return collector.stop("cancelled");
                   const track = tracks[Number(m.content) - 1];
                   player.queue.add(track);
                   message.channel.send(
                    `Enqueing \`${track.title}\` \`${Utils.formatTime(
                      track.duration,
                      true
                    )}\``
                  );
                  if (!player.playing) player.play();

                });
                collector.on("end", (_, reason) => {

                    if(["time","cancelled"].includes(reason)) return message.channel.send("Cancelled selection.");

                });
                break;

                case "PLAYLIST_LOADED":
                    res.playlist.tracks.forEach(track => player.queue.add(track));
                    const duration = Utils.formatTime(res.playlist.tracks.reduce((acc, cur) => ({duration: acc.duration + cur.duration})).duration, true);
                    message.channel.send(
                        `Enqueing \`${res.playlist.tracks.length}\` \`${duration}\` tracks in playlist \`${res.playlist.info.name}\``
                      );
                        if (!player.playing) player.play();
                        break;
      }
    }).catch(err => message.channel.send(err.message));
  },
};
