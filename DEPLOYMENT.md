# WF4S Radio v2 - Railway Deployment Guide

## Prerequisites

1. **GitHub Repository**: https://github.com/knghtmre/wf4s-radio-v2
2. **Railway Account**: https://railway.app
3. **Discord Bot**: Created at https://discord.com/developers/applications
4. **OpenAI API Key**: From https://platform.openai.com
5. **Azure Speech Key** (optional): From https://azure.microsoft.com/en-us/services/cognitive-services/speech-services/

## Step 1: Discord Bot Setup

### Create Discord Application
1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Name it "WF4S Haulin' Radio"
4. Go to "Bot" tab
5. Click "Add Bot"
6. Copy the **Bot Token** (you'll need this)
7. Copy the **Application ID** (this is your CLIENT_ID)

### Enable Intents
Under "Bot" tab, enable:
- ✅ Presence Intent
- ✅ Server Members Intent
- ✅ Message Content Intent

### Bot Permissions
Under "OAuth2" → "URL Generator":
- Scopes: `bot`, `applications.commands`
- Bot Permissions:
  - ✅ Read Messages/View Channels
  - ✅ Send Messages
  - ✅ Connect
  - ✅ Speak
  - ✅ Use Voice Activity

Copy the generated URL and use it to invite the bot to your server.

## Step 2: Get API Keys

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy and save it (you won't see it again)

### Azure Speech Key (Optional but Recommended)
1. Go to https://portal.azure.com
2. Create "Speech Services" resource
3. Copy Key 1 and Region (e.g., "eastus")

If you skip Azure, the bot will use Google TTS (lower quality but free).

## Step 3: Railway Deployment

### Connect GitHub Repository
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `knghtmre/wf4s-radio-v2`
5. Click "Deploy Now"

### Configure Environment Variables
In Railway dashboard, go to "Variables" tab and add:

```env
TOKEN=<your_discord_bot_token>
CLIENT_ID=<your_discord_application_id>
VOICE_CHANNEL_NAME=📻 | WF4S Haulin' Radio
OPENAI_API_KEY=<your_openai_api_key>
AZURE_SPEECH_KEY=<your_azure_speech_key>
AZURE_SPEECH_REGION=eastus
AUTO_RADIO_MODE=true
NEWS_FREQUENCY=3
```

**Important**: Replace all `<values>` with your actual keys!

### Railway Settings
Railway should auto-detect:
- ✅ Build Command: `npm install`
- ✅ Start Command: `npm start`
- ✅ Node Version: 22.x

If not, set them manually in "Settings" → "Deploy".

## Step 4: Verify Deployment

### Check Logs
In Railway dashboard, click "Deployments" → Latest deployment → "View Logs"

Look for:
```
[Bot] F4S Haulin' Radio#6978 is online!
[Bot] Serving 1 guild(s)
[Auto Radio] Mode enabled - waiting for users to join voice channel
```

### Test in Discord
1. Join the voice channel named `📻 | WF4S Haulin' Radio`
2. Bot should automatically connect and start playing music
3. Listen for Ava's DJ announcements
4. Try manual commands: `!play house music`

## Step 5: Update Star Citizen News (Optional)

To update the news cache:

1. SSH into Railway container or run locally:
```bash
node fetch_sc_news.js
```

2. Commit updated `sc_news.json`:
```bash
git add sc_news.json
git commit -m "Update Star Citizen news"
git push
```

Railway will auto-redeploy with new news.

## Troubleshooting

### Bot not connecting to voice channel
**Problem**: Bot joins but no audio  
**Solution**: 
- Check bot has "Connect" and "Speak" permissions
- Verify `VOICE_CHANNEL_NAME` matches exactly (including emoji)
- Check Railway logs for errors

### Ava not announcing
**Problem**: Music plays but no DJ voice  
**Solution**:
- Verify `OPENAI_API_KEY` is valid
- Check Railway logs for OpenAI errors
- If Azure TTS fails, bot falls back to Google TTS

### YouTube streaming fails
**Problem**: "No results found" or playback errors  
**Solution**:
- discord-player handles this automatically
- Check Railway logs for specific errors
- Try different search terms

### Bot goes offline
**Problem**: Bot disconnects after inactivity  
**Solution**:
- Railway free tier has limitations
- Upgrade to Railway Pro for 24/7 uptime
- Or use a ping service (not recommended)

### High API costs
**Problem**: OpenAI API usage too high  
**Solution**:
- Reduce `NEWS_FREQUENCY` (e.g., from 3 to 5)
- Use GPT-3.5-turbo instead of GPT-4 (edit `ava-dj.js`)
- Disable AI DJ temporarily (comment out in `radio-manager.js`)

## Configuration Options

### Auto Radio Mode
```env
AUTO_RADIO_MODE=true  # Bot starts automatically when users join
AUTO_RADIO_MODE=false # Manual !play commands only
```

### News Frequency
```env
NEWS_FREQUENCY=3  # Announce news every 3 songs
NEWS_FREQUENCY=5  # Announce news every 5 songs
```

### Voice Channel Name
```env
VOICE_CHANNEL_NAME=📻 | WF4S Haulin' Radio  # Must match exactly
```

## Updating the Bot

Railway auto-deploys when you push to GitHub:

```bash
git pull origin main
# Make your changes
git add -A
git commit -m "Your changes"
git push origin main
```

Railway will automatically rebuild and redeploy.

## Cost Estimates

### Free Tier
- **Railway**: $5 credit/month (enough for testing)
- **Discord**: Free
- **Google TTS**: Free (with limitations)

### Paid (Recommended for 24/7)
- **Railway Pro**: ~$5-10/month
- **OpenAI API**: ~$2-5/month (depends on usage)
- **Azure Speech**: ~$1-3/month (pay-per-use)

**Total**: ~$8-18/month for 24/7 operation

## Support

- **GitHub Issues**: https://github.com/knghtmre/wf4s-radio-v2/issues
- **Discord**: Contact WF4S team

## Next Steps

1. ✅ Deploy to Railway
2. ✅ Test basic functionality
3. ✅ Customize Ava's personality (edit `ava-dj.js`)
4. ✅ Add more music sources
5. ✅ Schedule Zulu time announcements
6. ✅ Monitor and optimize costs

Happy hauling! 🚀
