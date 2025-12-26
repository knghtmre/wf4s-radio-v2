const { QueryType } = require('discord-player');

module.exports = {
    name: 'play',
    aliases: ['p'],
    utilisation: '{prefix}play [song name/URL]',
    voiceChannel: true,

    async execute(client, message, args) {
        if (!args[0]) return message.channel.send(`${message.author}, Write the name of the music you want to search. ❌`);

        const searchResult = await client.player.search(args.join(' '), {
            requestedBy: message.member,
            searchEngine: QueryType.AUTO
        });

        if (!searchResult || !searchResult.tracks.length) {
            return message.channel.send(`${message.author}, No results found! ❌`);
        }

        try {
            const queue = client.player.nodes.create(message.guild, {
                metadata: {
                    channel: message.channel,
                    voiceChannel: message.member.voice.channel,
                    radioManager: client.radioManager
                },
                selfDeaf: true,
                volume: 35,
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 300000,
                leaveOnEnd: false
            });

            if (!queue.connection) {
                await queue.connect(message.member.voice.channel);
            }

            await message.channel.send(`${searchResult.playlist ? 'Playlist' : 'Track'} loading... 🎧`);

            searchResult.playlist ? queue.addTrack(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);

            if (!queue.node.isPlaying()) {
                await queue.node.play();
            }
        } catch (error) {
            console.error('[Play Command] Error:', error);
            return message.channel.send(`${message.author}, I can't join the audio channel. ❌`);
        }
    },
};
