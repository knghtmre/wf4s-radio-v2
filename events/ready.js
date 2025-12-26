module.exports = async (client) => {
    console.log(`[Bot] ${client.user.tag} is online!`);
    console.log(`[Bot] Serving ${client.guilds.cache.size} guild(s)`);
    
    if (client.config.autoRadioMode) {
        console.log('[Auto Radio] Mode enabled - waiting for users to join voice channel');
    }

    client.user.setActivity(client.config.playing);
};