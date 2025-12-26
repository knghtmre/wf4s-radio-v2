require('dotenv').config();

module.exports = {
        px: '!',
        playing: 'WF4S Haulin\' Radio 📻',
        voiceChannelName: process.env.VOICE_CHANNEL_NAME || '📻 | WF4S Haulin\' Radio',
        autoRadioMode: process.env.AUTO_RADIO_MODE === 'true',

    opt: {
        DJ: {
            enabled: false, //IF YOU WANT ONLY DJS TO USE IT, set false to true.
            roleName: 'DJ', //WRITE WHAT THE NAME OF THE DJ ROLE WILL BE, THEY CAN USE IT ON YOUR SERVER
            commands: ['back', 'clear', 'filter', 'loop', 'pause', 'resume', 'skip', 'stop', 'volume'] //Please don't touch
        },
        maxVol: 100,
        loopMessage: false, //Please don't touch
        discordPlayer: {
            ytdlOptions: {
                quality: 'highestaudio', //Please don't touch
                highWaterMark: 1 << 25 //Please don't touch
            }
        }
    }
};
