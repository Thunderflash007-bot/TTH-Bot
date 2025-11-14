const TwitchNotification = require('../models/TwitchNotification');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

// Twitch API Client ID & Secret sollten in .env stehen
// Für Demo erstmal Platzhalter
let twitchAccessToken = null;
let tokenExpiresAt = 0;

/**
 * Holt einen Twitch Access Token
 */
async function getTwitchToken() {
    if (twitchAccessToken && Date.now() < tokenExpiresAt) {
        return twitchAccessToken;
    }
    
    // In production: process.env.TWITCH_CLIENT_ID und TWITCH_CLIENT_SECRET
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
        console.warn('⚠️ Twitch API credentials fehlen in .env (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET)');
        return null;
    }
    
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials'
            }
        });
        
        twitchAccessToken = response.data.access_token;
        tokenExpiresAt = Date.now() + (response.data.expires_in * 1000) - 60000; // 1min Buffer
        
        return twitchAccessToken;
    } catch (error) {
        console.error('❌ Fehler beim Holen des Twitch Tokens:', error.message);
        return null;
    }
}

/**
 * Prüft ob ein Streamer online ist
 */
async function checkStreamStatus(username) {
    const token = await getTwitchToken();
    if (!token) return null;
    
    const clientId = process.env.TWITCH_CLIENT_ID;
    
    try {
        const response = await axios.get('https://api.twitch.tv/helix/streams', {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${token}`
            },
            params: {
                user_login: username
            }
        });
        
        if (response.data.data && response.data.data.length > 0) {
            return response.data.data[0]; // Stream ist online
        }
        
        return null; // Stream ist offline
    } catch (error) {
        console.error(`❌ Fehler beim Prüfen von ${username}:`, error.message);
        return null;
    }
}

/**
 * Startet den Twitch Stream Checker (alle 2 Minuten)
 */
function startTwitchChecker(client) {
    console.log('✅ Twitch Stream Checker gestartet');
    
    setInterval(async () => {
        try {
            const notifications = TwitchNotification.find({ enabled: true });
            
            for (const notification of notifications) {
                const streamData = await checkStreamStatus(notification.twitchUsername);
                
                // Stream ist online
                if (streamData) {
                    // Prüfe ob bereits benachrichtigt (via lastStreamId)
                    if (notification.lastStreamId === streamData.id) {
                        continue; // Bereits benachrichtigt
                    }
                    
                    // Neue Stream-Session - Benachrichtigung senden
                    const guild = client.guilds.cache.get(notification.guildId);
                    if (!guild) continue;
                    
                    const channel = await guild.channels.fetch(notification.channelId).catch(() => null);
                    if (!channel) continue;
                    
                    // Embed erstellen
                    const embed = new EmbedBuilder()
                        .setColor('#9146FF')
                        .setTitle(`🔴 ${streamData.user_name} ist jetzt LIVE!`)
                        .setDescription(streamData.title)
                        .setURL(`https://twitch.tv/${notification.twitchUsername}`)
                        .addFields(
                            { name: '🎮 Spiel', value: streamData.game_name || 'Kein Spiel', inline: true },
                            { name: '👥 Zuschauer', value: streamData.viewer_count.toString(), inline: true }
                        )
                        .setTimestamp();
                    
                    // Nachricht mit optionalem Mention
                    let content = notification.message || `**${streamData.user_name}** ist jetzt live!`;
                    if (notification.mention) {
                        content = `${notification.mention} ${content}`;
                    }
                    
                    await channel.send({ content, embeds: [embed] });
                    
                    // lastStreamId aktualisieren
                    notification.lastStreamId = streamData.id;
                    TwitchNotification.save(notification);
                    
                    console.log(`✅ Twitch Notification gesendet: ${notification.twitchUsername}`);
                }
            }
        } catch (error) {
            console.error('❌ Fehler im Twitch Checker:', error);
        }
    }, 120000); // Alle 2 Minuten
}

module.exports = { startTwitchChecker, checkStreamStatus };
