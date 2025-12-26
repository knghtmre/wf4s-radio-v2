const OpenAI = require('openai');
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const googleTTS = require('google-tts-api');
const fs = require('fs');
const path = require('path');

class AvaDJ {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.lastAnnouncements = [];
        this.maxHistory = 5;
    }

    async generateAnnouncement(track, context = 'song') {
        const contextPrompts = {
            song: `You're introducing the next song: "${track.title}" by ${track.author}`,
            news: `You're about to share Star Citizen news`,
            time: `You're announcing the current Zulu time`
        };

        const recentPhrases = this.lastAnnouncements.join('\n');
        
        const prompt = `You are Ava, the AI DJ for WF4S Haulin' Radio, a space trucker radio station in the Star Citizen universe.

PERSONALITY:
- Sarcastic, flirty, and funny
- Uses space puns and trucker slang
- Can use "damn" and "hell" appropriately
- Keep it short (1-2 sentences max)
- Sound natural and conversational

TASK: ${contextPrompts[context]}

IMPORTANT: DO NOT repeat these phrases from your recent announcements:
${recentPhrases}

Generate a fresh, unique announcement:`;

        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.9,
                max_tokens: 100
            });

            const announcement = completion.choices[0].message.content.trim();
            
            // Track announcement to avoid repetition
            this.lastAnnouncements.push(announcement);
            if (this.lastAnnouncements.length > this.maxHistory) {
                this.lastAnnouncements.shift();
            }

            console.log(`[Ava DJ] Generated: ${announcement}`);
            return announcement;
        } catch (error) {
            console.error('[Ava DJ] OpenAI error:', error.message);
            return this.getFallbackAnnouncement(track, context);
        }
    }

    getFallbackAnnouncement(track, context) {
        const fallbacks = {
            song: [
                `Next up: ${track.title}. Let's ride!`,
                `Coming at you with ${track.title}. Buckle up!`,
                `Here's ${track.title} to keep those engines humming.`
            ],
            news: [
                `Time for some Star Citizen news, space cowboys!`,
                `Let's catch up on what's happening in the 'verse.`
            ],
            time: [
                `Here's your Zulu time check, haulers.`,
                `Time update for all you space truckers.`
            ]
        };
        
        const options = fallbacks[context] || fallbacks.song;
        return options[Math.floor(Math.random() * options.length)];
    }

    async synthesizeSpeech(text) {
        // Try Azure TTS first
        if (process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) {
            try {
                return await this.synthesizeAzure(text);
            } catch (error) {
                console.error('[Ava DJ] Azure TTS failed:', error.message);
            }
        }

        // Fallback to Google TTS
        try {
            return await this.synthesizeGoogle(text);
        } catch (error) {
            console.error('[Ava DJ] Google TTS failed:', error.message);
            throw new Error('All TTS services failed');
        }
    }

    async synthesizeAzure(text) {
        return new Promise((resolve, reject) => {
            const speechConfig = sdk.SpeechConfig.fromSubscription(
                process.env.AZURE_SPEECH_KEY,
                process.env.AZURE_SPEECH_REGION
            );

            // Use Ava's voice with SSML for natural speech
            const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
                <voice name="en-US-AvaMultilingualNeural">
                    <prosody rate="1.0" pitch="0%">
                        ${text}
                    </prosody>
                </voice>
            </speak>`;

            const filename = path.join(__dirname, `ava-${Date.now()}.mp3`);
            const audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename);
            
            const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

            synthesizer.speakSsmlAsync(
                ssml,
                result => {
                    synthesizer.close();
                    if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                        console.log('[Ava DJ] Azure TTS: Audio synthesized successfully');
                        resolve(filename);
                    } else {
                        reject(new Error(`Azure TTS failed: ${result.errorDetails}`));
                    }
                },
                error => {
                    synthesizer.close();
                    reject(error);
                }
            );
        });
    }

    async synthesizeGoogle(text) {
        const url = googleTTS.getAudioUrl(text, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com'
        });

        const fetch = require('node-fetch');
        const response = await fetch(url);
        const buffer = await response.buffer();

        const filename = path.join(__dirname, `ava-${Date.now()}.mp3`);
        fs.writeFileSync(filename, buffer);

        console.log('[Ava DJ] Google TTS: Audio synthesized successfully');
        return filename;
    }

    cleanupAudioFile(filename) {
        try {
            if (fs.existsSync(filename)) {
                fs.unlinkSync(filename);
                console.log(`[Ava DJ] Cleaned up audio file: ${filename}`);
            }
        } catch (error) {
            console.error(`[Ava DJ] Error cleaning up file: ${error.message}`);
        }
    }
}

module.exports = AvaDJ;
