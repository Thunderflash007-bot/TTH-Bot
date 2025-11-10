# TTH-Bot

Ein multifunktionaler Discord-Management-Bot mit Web-Dashboard – ähnlich wie Galaxy Bot oder Arcane.

## 🎯 Features

### Discord Bot
- ✅ **Ticket-System** mit Embeds & Buttons
- 📋 **Bewerbungsformular** mit Discord Modals
- 🛡️ **Automoderation & Logging**
- 🎭 **Rollen- und Channel-Management**
- 👋 **Welcome- und Leave-Messages**
- ⭐ **Levelsystem (XP)**
- 🎵 **Musik** (vorbereitet)
- 🌐 **Multi-Guild Support**

### Web-Dashboard
- 🔐 Discord OAuth2 Login
- 📊 Statistik-Dashboard
- 🎫 Ticket-Verwaltung
- 📝 Bewerbungen einsehen
- ⚙️ Server-Konfiguration
- 📜 Moderations-Logs

## 🚀 Installation

### Voraussetzungen
- Node.js 18+
- MongoDB
- Discord Bot Application ([Discord Developer Portal](https://discord.com/developers/applications))

### Setup

1. **Projekt klonen**
```bash
git clone https://github.com/yourusername/TTH-Bot.git
cd TTH-Bot
```

2. **Abhängigkeiten installieren**
```bash
npm install
```

3. **Umgebungsvariablen konfigurieren**
```bash
cp .env.example .env
# Bearbeite .env mit deinen Werten
```

4. **MongoDB starten** (falls lokal)
```bash
# In separatem Terminal
mongod
```

5. **Bot starten**
```bash
npm start
```

6. **Web-Interface starten** (in separatem Terminal)
```bash
npm run interface
```

## ⚙️ Konfiguration

### Discord Bot Application
1. Erstelle eine neue Application im [Discord Developer Portal](https://discord.com/developers/applications)
2. Aktiviere "MESSAGE CONTENT INTENT" und "SERVER MEMBERS INTENT"
3. Kopiere Token, Client ID und Client Secret in `.env`
4. Füge Redirect URL hinzu: `http://localhost:8080/auth/discord/callback`

### .env Variablen
```env
DISCORD_TOKEN=dein_bot_token
CLIENT_ID=deine_client_id
CLIENT_SECRET=dein_client_secret
MONGO_URI=mongodb://localhost:27017/tth-bot
SESSION_SECRET=zufälliger_string
OAUTH_CALLBACK_URL=http://localhost:8080/auth/discord/callback
BOT_PORT=3000
WEB_PORT=8080
```

## 📁 Projektstruktur
````
- Bot-Core (index.js, handlers, events, commands, components)
- Web-Interface (server.js, routes, views)
- Database Models (Mongoose Schemas)
- Utils und Config
```