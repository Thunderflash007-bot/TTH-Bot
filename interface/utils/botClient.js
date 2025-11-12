// Bot-Client Verbindung für Interface (über HTTP API)
const axios = require('axios');
const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';

let botClient = null;

module.exports = {
    setClient(client) {
        botClient = client;
        console.log('✅ Bot-Client mit Interface verbunden');
    },
    
    getClient() {
        return botClient;
    },
    
    async getGuildData(guildId) {
        try {
            // Versuche zuerst direkte Verbindung (wenn im gleichen Prozess)
            if (botClient) {
                const guild = await botClient.guilds.fetch(guildId);
                
                const channels = guild.channels.cache
                    .filter(c => c.type === 0)
                    .map(c => ({
                        id: c.id,
                        name: c.name,
                        type: c.type,
                        position: c.position
                    }))
                    .sort((a, b) => a.position - b.position);
                
                const categories = guild.channels.cache
                    .filter(c => c.type === 4)
                    .map(c => ({
                        id: c.id,
                        name: c.name,
                        position: c.position
                    }))
                    .sort((a, b) => a.position - b.position);
                
                const roles = guild.roles.cache
                    .filter(r => r.id !== guild.id)
                    .map(r => ({
                        id: r.id,
                        name: r.name,
                        color: r.hexColor,
                        position: r.position
                    }))
                    .sort((a, b) => b.position - a.position);
                
                return { channels, categories, roles };
            }
            
            // Fallback: HTTP API
            const response = await axios.get(`${BOT_API_URL}/api/guilds/${guildId}`, {
                timeout: 5000
            });
            
            return {
                channels: response.data.channels || [],
                categories: response.data.categories || [],
                roles: response.data.roles || []
            };
        } catch (error) {
            console.error('Fehler beim Abrufen von Guild-Daten:', error.message);
            // Rückgabe leerer Arrays statt Fehler
            return { channels: [], categories: [], roles: [] };
        }
    },
    
    async sendTestWelcome(guildId, channelId, userId, customMessage) {
        try {
            // Versuche HTTP API
            const response = await axios.post(`${BOT_API_URL}/api/guilds/${guildId}/test-welcome`, {
                channelId,
                userId,
                customMessage
            }, {
                timeout: 5000
            });
            
            return response.data.success;
        } catch (error) {
            console.error('Fehler beim Senden der Test-Nachricht:', error.message);
            throw error;
        }
    },
    
    async checkBotStatus() {
        try {
            const response = await axios.get(`${BOT_API_URL}/api/health`, {
                timeout: 3000
            });
            return response.data;
        } catch (error) {
            return { status: 'offline', error: error.message };
        }
    }
};
