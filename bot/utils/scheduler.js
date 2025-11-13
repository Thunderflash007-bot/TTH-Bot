// Scheduler für geplante Nachrichten
const ScheduledMessage = require('../models/ScheduledMessage');

class MessageScheduler {
    constructor(client) {
        this.client = client;
        this.activeJobs = new Map();
    }

    start() {
        console.log('🕐 Message Scheduler gestartet');
        
        // Check alle 60 Sekunden
        this.interval = setInterval(() => {
            this.checkScheduledMessages();
        }, 60000);

        // Initial check
        this.checkScheduledMessages();
    }

    async checkScheduledMessages() {
        try {
            const messages = await ScheduledMessage.find({ enabled: true });
            
            for (const msg of messages) {
                if (this.shouldSendNow(msg)) {
                    await this.sendScheduledMessage(msg);
                    
                    // Wenn einmalig, deaktivieren
                    if (msg.scheduleType === 'once') {
                        msg.enabled = false;
                        ScheduledMessage.save(msg);
                    }
                }
            }
        } catch (error) {
            console.error('Fehler beim Prüfen geplanter Nachrichten:', error);
        }
    }

    shouldSendNow(msg) {
        const now = new Date();
        
        if (msg.scheduleType === 'once') {
            const scheduleDate = new Date(`${msg.date}T${msg.time}`);
            const diff = Math.abs(now - scheduleDate);
            return diff < 60000; // Innerhalb 1 Minute
        }
        
        if (msg.scheduleType === 'daily') {
            const [hour, minute] = msg.time.split(':');
            return now.getHours() === parseInt(hour) && now.getMinutes() === parseInt(minute);
        }
        
        if (msg.scheduleType === 'weekly') {
            const [hour, minute] = msg.time.split(':');
            return now.getDay() === msg.day && 
                   now.getHours() === parseInt(hour) && 
                   now.getMinutes() === parseInt(minute);
        }
        
        if (msg.scheduleType === 'interval') {
            if (!msg.lastSent) return true; // Sofort beim ersten Mal
            
            const lastSent = new Date(msg.lastSent);
            let intervalMs = 0;
            
            if (msg.intervalUnit === 'minutes') {
                intervalMs = msg.intervalValue * 60 * 1000;
            } else if (msg.intervalUnit === 'hours') {
                intervalMs = msg.intervalValue * 60 * 60 * 1000;
            } else if (msg.intervalUnit === 'days') {
                intervalMs = msg.intervalValue * 24 * 60 * 60 * 1000;
            }
            
            return (now - lastSent) >= intervalMs;
        }
        
        return false;
    }

    async sendScheduledMessage(msg) {
        try {
            const guild = await this.client.guilds.fetch(msg.guildId);
            const channel = await guild.channels.fetch(msg.channelId);
            
            if (!channel) {
                console.error('Channel nicht gefunden:', msg.channelId);
                return;
            }

            // Variablen ersetzen
            let message = msg.message;
            message = message.replace(/{server}/g, guild.name);
            message = message.replace(/{members}/g, guild.memberCount);
            message = message.replace(/{date}/g, new Date().toLocaleDateString('de-DE'));
            message = message.replace(/{time}/g, new Date().toLocaleTimeString('de-DE'));

            await channel.send(message);
            
            // Update lastSent
            msg.lastSent = new Date();
            ScheduledMessage.save(msg);
            
            console.log(`✅ Geplante Nachricht gesendet in ${channel.name}`);
        } catch (error) {
            console.error('Fehler beim Senden geplanter Nachricht:', error);
        }
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            console.log('🛑 Message Scheduler gestoppt');
        }
    }
}

module.exports = MessageScheduler;
