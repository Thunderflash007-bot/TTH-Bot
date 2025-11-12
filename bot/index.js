require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ]
});

client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.selectMenus = new Collection();

// Handler laden
const handlerFiles = fs.readdirSync(path.join(__dirname, 'handlers')).filter(file => file.endsWith('.js'));
for (const file of handlerFiles) {
    require(`./handlers/${file}`)(client);
}

console.log('✅ JSON-Datenbank initialisiert');

// Bot-Client für Interface verfügbar machen
client.once('ready', () => {
    try {
        const botClient = require('../interface/utils/botClient');
        botClient.setClient(client);
    } catch (error) {
        // Interface läuft möglicherweise nicht
    }
    
    // Starte Bot API Server
    const { startBotAPI } = require('./api');
    startBotAPI(client);
    
    // Starte Message Scheduler
    const MessageScheduler = require('./utils/scheduler');
    const scheduler = new MessageScheduler(client);
    scheduler.start();
    client.scheduler = scheduler;
    
    // Starte Auto-Role Handler
    const AutoRoleHandler = require('./utils/autoRoleHandler');
    const autoRoleHandler = new AutoRoleHandler(client);
    client.autoRoleHandler = autoRoleHandler;
});

// Bot starten
client.login(process.env.DISCORD_TOKEN);

module.exports = client;
