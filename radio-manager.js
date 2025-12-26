const { QueryType } = require('discord-player');
const AvaDJ = require('./ava-dj');
const fs = require('fs');
const path = require('path');

class RadioManager {
    constructor(client) {
        this.client = client;
        this.avaDJ = new AvaDJ();
        this.songCount = 0;
        this.newsFrequency = parseInt(process.env.NEWS_FREQUENCY || '3');
        this.scNews = [];
        this.loadStarCitizenNews();
    }

    loadStarCitizenNews() {
        try {
            const newsFile = path.join(__dirname, 'sc_news.json');
            if (fs.existsSync(newsFile)) {
                const data = JSON.parse(fs.readFileSync(newsFile, 'utf8'));
                this.scNews = data.articles || [];
                console.log(`[Radio Manager] Loaded ${this.scNews.length} Star Citizen news stories`);
            }
        } catch (error) {
            console.error('[Radio Manager] Error loading SC news:', error.message);
        }
    }

    async shouldAnnounceNews() {
        return this.songCount > 0 && this.songCount % this.newsFrequency === 0;
    }

    async getRandomNews() {
        if (this.scNews.length === 0) return null;
        return this.scNews[Math.floor(Math.random() * this.scNews.length)];
    }

    getZuluTime() {
        const now = new Date();
        return now.toISOString().substring(11, 19) + ' Zulu';
    }

    async announceBeforeTrack(queue, track) {
        try {
            // Check if we should announce news
            if (await this.shouldAnnounceNews()) {
                await this.announceNews(queue);
            }

            // Generate DJ announcement for the track
            const announcement = await this.avaDJ.generateAnnouncement(track, 'song');
            const audioFile = await this.avaDJ.synthesizeSpeech(announcement);

            // Play the announcement
            await this.playAudioFile(queue, audioFile);

            // Cleanup
            this.avaDJ.cleanupAudioFile(audioFile);

            this.songCount++;
        } catch (error) {
            console.error('[Radio Manager] Error in announceBeforeTrack:', error.message);
            // Continue playing music even if announcement fails
        }
    }

    async announceNews(queue) {
        try {
            const news = await this.getRandomNews();
            if (!news) return;

            const newsText = `Star Citizen news update: ${news.title}. ${news.description || ''}`;
            const announcement = await this.avaDJ.generateAnnouncement({ title: newsText }, 'news');
            const audioFile = await this.avaDJ.synthesizeSpeech(announcement + ' ' + newsText);

            await this.playAudioFile(queue, audioFile);
            this.avaDJ.cleanupAudioFile(audioFile);

            console.log('[Radio Manager] Announced SC news:', news.title);
        } catch (error) {
            console.error('[Radio Manager] Error announcing news:', error.message);
        }
    }

    async announceZuluTime(queue) {
        try {
            const zuluTime = this.getZuluTime();
            const announcement = await this.avaDJ.generateAnnouncement({ title: zuluTime }, 'time');
            const fullText = `${announcement} The time is ${zuluTime}.`;
            const audioFile = await this.avaDJ.synthesizeSpeech(fullText);

            await this.playAudioFile(queue, audioFile);
            this.avaDJ.cleanupAudioFile(audioFile);

            console.log('[Radio Manager] Announced Zulu time:', zuluTime);
        } catch (error) {
            console.error('[Radio Manager] Error announcing time:', error.message);
        }
    }

    async playAudioFile(queue, audioFile) {
        return new Promise((resolve, reject) => {
            // This is a placeholder - we'll need to implement proper audio injection
            // For now, we'll just log it
            console.log('[Radio Manager] Would play audio file:', audioFile);
            setTimeout(resolve, 2000); // Simulate playback time
        });
    }

    async startAutoRadio(guild, voiceChannel, textChannel) {
        try {
            console.log('[Radio Manager] Starting auto-radio mode...');

            // Search for popular music
            const searchQueries = [
                'house music mix',
                'electronic music mix',
                'chill music mix',
                'lofi hip hop',
                'synthwave mix'
            ];

            const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
            
            const searchResult = await this.client.player.search(randomQuery, {
                requestedBy: textChannel,
                searchEngine: QueryType.YOUTUBE_SEARCH
            });

            if (!searchResult || !searchResult.tracks.length) {
                console.error('[Radio Manager] No tracks found for auto-radio');
                return false;
            }

            const queue = await this.client.player.nodes.create(guild, {
                metadata: {
                    channel: textChannel,
                    voiceChannel: voiceChannel,
                    radioManager: this
                },
                selfDeaf: true,
                volume: 35,
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 300000,
                leaveOnEnd: false,
                leaveOnEndCooldown: 300000
            });

            if (!queue.connection) {
                await queue.connect(voiceChannel);
            }

            // Add multiple tracks for continuous playback
            queue.addTrack(searchResult.tracks.slice(0, 20));

            if (!queue.isPlaying()) {
                await queue.node.play();
            }

            console.log('[Radio Manager] Auto-radio started successfully');
            return true;
        } catch (error) {
            console.error('[Radio Manager] Error starting auto-radio:', error.message);
            return false;
        }
    }
}

module.exports = RadioManager;
