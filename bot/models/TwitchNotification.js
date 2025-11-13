const db = require('../utils/database');

class TwitchNotification {
    static find(query = {}) {
        const notifications = db.getData('/twitchNotifications') || [];
        
        if (Object.keys(query).length === 0) {
            return notifications;
        }
        
        return notifications.filter(notif => {
            return Object.keys(query).every(key => notif[key] === query[key]);
        });
    }
    
    static findOne(query) {
        const notifications = this.find(query);
        return notifications.length > 0 ? notifications[0] : null;
    }
    
    static create(data) {
        const notifications = db.getData('/twitchNotifications') || [];
        const newNotification = {
            id: Date.now().toString(),
            guildId: data.guildId,
            channelId: data.channelId,
            twitchUsername: data.twitchUsername,
            message: data.message || '{user} ist jetzt live! 🔴',
            mention: data.mention || null,
            enabled: true,
            lastStreamId: null,
            createdAt: new Date().toISOString()
        };
        
        notifications.push(newNotification);
        db.setData('/twitchNotifications', notifications);
        return newNotification;
    }
    
    static remove(id) {
        const notifications = db.getData('/twitchNotifications') || [];
        const filtered = notifications.filter(n => n.id !== id);
        db.setData('/twitchNotifications', filtered);
        return filtered.length < notifications.length;
    }
    
    static save(notification) {
        const notifications = db.getData('/twitchNotifications') || [];
        const index = notifications.findIndex(n => n.id === notification.id);
        
        if (index !== -1) {
            notifications[index] = notification;
            db.setData('/twitchNotifications', notifications);
        }
        
        return notification;
    }
}

module.exports = TwitchNotification;
