const { Player } = require('discord-player');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { readdirSync } = require('fs');
const RadioManager = require('./radio-manager');

// Import extractors
const { YouTubeExtractor, SpotifyExtractor, SoundCloudExtractor } = require('@discord-player/extractor');

// Create Discord client with v14 intents
let client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});

client.config = require('./config');
client.player = new Player(client, client.config.opt.discordPlayer);
client.commands = new Collection();
client.radioManager = new RadioManager(client);

const player = client.player;

// Register extractors for YouTube, Spotify, SoundCloud, etc.
player.extractors.register(YouTubeExtractor, {});
player.extractors.register(SpotifyExtractor, {});
player.extractors.register(SoundCloudExtractor, {});
console.log('[Player] Registered extractors: YouTube, Spotify, SoundCloud');

// Load events
const events = readdirSync('./events/').filter(file => file.endsWith('.js'));
for (const file of events) {
    const event = require(`./events/${file}`);
    console.log(`-> Loaded event ${file.split('.')[0]}`);
    client.on(file.split('.')[0], event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
}

// Load commands
console.log(`-> Loaded commands...`);
readdirSync('./commands/').forEach(dirs => {
    const commands = readdirSync(`./commands/${dirs}`).filter(files => files.endsWith('.js'));
    for (const file of commands) {
        const command = require(`./commands/${dirs}/${file}`);
        console.log(`${command.name.toLowerCase()} Load Command!`);
        client.commands.set(command.name.toLowerCase(), command);
        delete require.cache[require.resolve(`./commands/${dirs}/${file}`)];
    }
});

// Player event handlers
player.events.on('error', (queue, error) => {
    console.log(`[Player Error] ${error.message}`);
});

player.events.on('connectionError', (queue, error) => {
    console.log(`[Connection Error] ${error.message}`);
});

player.events.on('playerStart', (queue, track) => {
    console.log(`[Now Playing] ${track.title} by ${track.author}`);
    
    // Announce with Ava DJ (if radio manager is available)
    if (queue.metadata.radioManager) {
        queue.metadata.radioManager.announceBeforeTrack(queue, track).catch(err => {
            console.error('[Ava DJ] Announcement failed:', err.message);
        });
    }
    
    if (!client.config.opt.loopMessage && queue.repeatMode !== 0) return;
    
    const channel = queue.metadata.channel || queue.metadata;
    if (channel && channel.send) {
        channel.send(`🎵 Now playing: **${track.title}** by **${track.author}** 🎧`);
    }
});

player.events.on('audioTrackAdd', (queue, track) => {
    const channel = queue.metadata.channel || queue.metadata;
    if (channel && channel.send) {
        channel.send(`**${track.title}** added to playlist. ✅`);
    }
});

player.events.on('disconnect', (queue) => {
    const channel = queue.metadata.channel || queue.metadata;
    if (channel && channel.send) {
        channel.send('Disconnected from voice channel. The playlist has been cleared! ❌');
    }
});

player.events.on('emptyChannel', (queue) => {
    const channel = queue.metadata.channel || queue.metadata;
    if (channel && channel.send) {
        channel.send('Left the voice channel because it was empty. ❌');
    }
});

player.events.on('emptyQueue', (queue) => {
    const channel = queue.metadata.channel || queue.metadata;
    if (channel && channel.send) {
        channel.send('Queue finished! Add more music or I\'ll find something for you. ✅');
    }
    
    // Auto-restart radio if in auto-radio mode
    if (client.config.autoRadioMode && queue.metadata.voiceChannel) {
        console.log('[Auto Radio] Queue ended, restarting...');
        setTimeout(() => {
            client.radioManager.startAutoRadio(
                queue.guild,
                queue.metadata.voiceChannel,
                queue.metadata.channel || queue.metadata
            );
        }, 5000);
    }
});

// Voice state update handler for auto-reconnect
client.on('voiceStateUpdate', async (oldState, newState) => {
    if (!client.config.autoRadioMode) return;
    
    // Check if someone joined the target voice channel
    const targetChannelName = client.config.voiceChannelName;
    
    if (newState.channel && newState.channel.name === targetChannelName) {
        // Someone joined the radio channel
        const guild = newState.guild;
        const queue = player.nodes.get(guild.id);
        
        // If no queue or not playing, start auto-radio
        if (!queue || !queue.isPlaying()) {
            console.log(`[Auto Radio] User joined ${targetChannelName}, starting radio...`);
            
            // Find a text channel to send messages
            const textChannel = guild.channels.cache.find(ch => 
                ch.type === 0 && ch.permissionsFor(guild.members.me).has('SendMessages')
            );
            
            if (textChannel) {
                await client.radioManager.startAutoRadio(guild, newState.channel, textChannel);
            }
        }
    }
});

// Ready event
client.once('ready', () => {
    console.log(`[Bot] Logged in as ${client.user.tag}!`);
    client.user.setActivity(client.config.playing);
    
    // Auto-start radio if configured
    if (client.config.autoRadioMode) {
        console.log('[Auto Radio] Mode enabled - will start when users join voice channel');
    }
});

// Login
if (process.env.TOKEN) {
    client.login(process.env.TOKEN).catch(e => {
        console.log("The Bot Token You Entered Is Incorrect Or Your Bot's INTENTS Are OFF!");
        console.error(e);
    });
} else {
    console.log("Please Write Your Bot Token in the .env File!");
}
