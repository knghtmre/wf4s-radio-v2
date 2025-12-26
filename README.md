# WF4S Haulin' Radio Bot v2.0

24/7 Discord radio bot with AI DJ personality (Ava), Star Citizen news, and auto-radio features.

## Features

- 🎵 **Auto Radio Mode** - Automatically starts playing when users join the voice channel
- 🤖 **Ava AI DJ** - Sarcastic, flirty AI DJ with unique personality using GPT-4
- 🎙️ **High-Quality Voice** - Azure TTS (AvaMultilingualNeural) with Google TTS fallback
- 📰 **Star Citizen News** - Periodic news announcements every 3-5 songs
- ⏰ **Zulu Time** - Time announcements for space truckers
- 🔄 **Anti-Repetition** - Tracks last 5 announcements to avoid repetitive phrases
- 🎶 **700+ Sources** - Supports YouTube, Spotify, SoundCloud, and more via discord-player

## Quick Start

### 1. Environment Variables

Copy `.env-sample` to `.env` and fill in:

```env
TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
VOICE_CHANNEL_NAME=📻 | WF4S Haulin' Radio
OPENAI_API_KEY=your_openai_api_key
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=eastus
AUTO_RADIO_MODE=true
NEWS_FREQUENCY=3
```

### 2. Install & Run

```bash
npm install
npm start
```

### 3. Deploy to Railway

1. Push to GitHub
2. Connect Railway to your repo
3. Add environment variables in Railway dashboard
4. Deploy!

## Commands

- `!play <song/URL>` - Play a song
- `!skip` - Skip current song
- `!pause` / `!resume` - Pause/resume playback
- `!stop` - Stop and clear queue
- `!queue` - Show current queue
- `!volume <0-100>` - Set volume
- `!help` - Show all commands

## Architecture

Built on **discord-player v6** framework for maximum stability.

### Why v2?

| Feature | v1 (Old Bot) | v2 (New Bot) |
|---------|--------------|--------------|
| Dependencies | 23 packages | 10 packages |
| YouTube handling | Manual | Framework |
| Stability | Issues | Rock solid |
| Maintenance | High | Low |

## Credits

- Based on [JockieMusic](https://github.com/KRISU2022/JockieMusic)
- Enhanced for WF4S community
- Powered by discord-player

## License

MIT
