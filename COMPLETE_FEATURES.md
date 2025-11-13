# TTH-Bot - Vollständige Feature-Liste

## ✅ Implementierte Features

### 🎫 Ticket-System
- **Setup**: `/setup-tickets` - Erstellt Ticket-Kategorie und Channels
- **Priority**: `/priority [low|medium|high]` - Setzt Ticket-Priorität (🟢🟠🔴)
- **Forward**: `/forward <rolle>` - Leitet Ticket an anderes Team weiter
- **Close**: `/close` - Schließt ein Ticket
- **Claim/Unclaim**: Über Buttons im Ticket

### 🛡️ Moderation
- **Warn**: `/warn <user> <grund>` - Warnt User (Auto-Ban bei 5 Warns)
- **Warns**: `/warns [user]` - Zeigt Warn-Historie
- **Unwarn**: `/unwarn <warn-id>` - Entfernt Warnung
- **Report**: `/report user` und `/report message` - Meldet User/Nachrichten
- **Ban**: `/ban <user> <grund>` - Bannt User
- **Kick**: `/kick <user> <grund>` - Kickt User
- **Clear**: `/clear <anzahl>` - Löscht Nachrichten

### 📰 Server-Management
- **News**: `/news <title> <beschreibung>` - Erstellt News-Embed
- **Projekt**: `/projekt create/delete/end` - Verwaltet Server-Projekte (auto-setup)
- **Port**: `/port add/remove` - Verwaltet Server-Ports
- **Serverinfo**: `/serverinfo` - Zeigt Server-Informationen
- **Userinfo**: `/userinfo [user]` - Zeigt User-Informationen

### 🎭 Rollen & Verifizierung
- **Verify-Setup**: `/verify-setup <passcode> <rolle>` - Richtet Verifizierung ein
- **Verify**: `/verify <passcode>` - Verifiziert User
- **Prefix**: `/prefix add/remove/list` - Auto-Nickname-Prefixes ([Partner], [Support])

### 💬 Kommunikation
- **Vorschlag**: `/vorschlag <beschreibung>` - Erstellt Vorschlag mit Thread
- **Kummerkasten**: `/kummerkasten` - Anonymer Support-Chat
- **Kummerkasten-Setup**: `/kummerkasten-setup <channel> <rolle>` - Richtet System ein

### 📺 Twitch Integration
- **Twitch**: `/twitch add/remove/list` - Verwaltet Stream-Notifications
- **Auto-Polling**: Prüft alle 2 Minuten auf Live-Streams
- **Custom Messages**: Eigene Benachrichtigungen + Mentions möglich

### 🏷️ Team-Management
- **Team**: `/team add/remove/list` - Verwaltet Team-Rollen
- **Welcome-Setup**: `/welcome-setup` - Begrüßungsnachrichten
- **Config**: `/config` - Zeigt Server-Konfiguration

### 📬 Automatisierung
- **Scheduled Messages**: Zeitgesteuerte Nachrichten über Dashboard
- **Auto-Roles**: Automatische Rollenvergabe beim Join
- **Custom Commands**: Eigene Befehle mit !prefix
- **Auto-Nickname-Prefixes**: Automatische Nickname-Anpassung bei Rollenvergabe

### 🎮 Utilities
- **Level**: `/level [user]` - Zeigt Level-Stand
- **Help**: `/help [command]` - Hilfe-System

---

## 🖥️ Dashboard Features

### Übersicht
- Server-Statistiken (Members, Channels, Roles)
- Bot-Status & Uptime
- Quick-Actions

### Konfiguration
- Ticket-System Setup
- Welcome/Leave Messages
- Log-Channel Konfiguration
- Prefix Einstellung
- Team-Rollen Verwaltung

### Moderation
- Warn-Verwaltung (mit User-Gruppierung & Farb-Coding)
- Report-System (User & Message Reports)
- Embed-Builder (mit Live-Preview)

### Verwaltung
- Scheduled Messages (Zeitgesteuerte Nachrichten)
- Auto-Roles (Join-basierte Rollenvergabe)
- Custom Commands (!-Befehle)
- Ankündigungen

### Systeme
- Backup & Restore (Server-Konfiguration)
- Logs & Statistiken

---

## 🔧 Admin Panel (Versteckt)
**URL**: `/admin/secret-control-panel-x7k9m2p`
**Zugriff**: Nur für `thunderflash.0.0.7`

Features:
- Wartungsarbeiten ankündigen
- Global-Broadcasts
- Bot-Statistiken
- Command-Reload

---

## 🚀 Setup-Anleitung

### 1. Bot einrichten
```bash
cd /workspaces/TTH-Bot
npm install
```

### 2. .env konfigurieren
```env
DISCORD_TOKEN=dein_token
CLIENT_ID=deine_client_id
CLIENT_SECRET=dein_secret

# Optional: Twitch API
TWITCH_CLIENT_ID=twitch_client_id
TWITCH_CLIENT_SECRET=twitch_secret
```

### 3. Bot starten
```bash
cd bot
node index.js
```

### 4. Interface starten
```bash
cd interface
node server.js
```

### 5. Bot-Commands registrieren
Nach dem ersten Start werden alle Commands automatisch bei Discord registriert.

---

## 📚 Command-Übersicht

### Config Commands
- `/setup-tickets` - Ticket-System
- `/verify-setup` - Verifizierung
- `/kummerkasten-setup` - Kummerkasten
- `/welcome-setup` - Welcome Messages
- `/team` - Team-Rollen
- `/prefix` - Nickname-Prefixes

### Moderation Commands
- `/warn`, `/warns`, `/unwarn`
- `/report` (user/message)
- `/ban`, `/kick`, `/clear`

### Utility Commands
- `/news` - News erstellen
- `/projekt` - Projekt-Management
- `/port` - Port-Management
- `/twitch` - Stream-Notifications
- `/vorschlag` - Vorschläge
- `/kummerkasten` - Anonymer Support
- `/verify` - Verifizierung
- `/help`, `/level`, `/serverinfo`, `/userinfo`

### Ticket Commands
- `/setup-tickets`, `/close`, `/priority`, `/forward`

---

## 🎨 Features im Detail

### Auto-Nickname-Prefixes
Fügt automatisch Prefixes zu Nicknames hinzu basierend auf Rollen:
```
Setup: /prefix add @Partner [Partner]
User mit Partner-Rolle → [Partner] Username
```

### Kummerkasten (Anonymer Chat)
User senden anonyme Nachrichten → Thread wird erstellt → Support-Team antwortet
- Anonyme ID: Nur letzte 4 Zeichen der User-ID sichtbar
- Thread-basiert für organisierte Kommunikation

### Projekt-Management
Ein Command erstellt vollständiges Projekt:
- Kategorie mit Projekt-Namen
- Text-Channel
- Voice-Channel
- Projekt-Rolle mit Permissions
- IP-Embed mit Server-Infos

### Warn-System
- Automatisches DM an User
- Auto-Ban bei 5 Warnings
- Dashboard-Verwaltung mit Farb-Coding
- Moderations-Log Integration

### Twitch Stream-Checker
- Background-Polling alle 2 Minuten
- Erkennt neue Streams (via Stream-ID)
- Custom Messages + Role-Mentions
- Embed mit Stream-Info, Game, Viewers, Thumbnail

---

## 🎯 Nächste mögliche Features

### Noch nicht implementiert:
- [ ] Modpack-Notifications (Modrinth/CurseForge API)
- [ ] Team-Kalender
- [ ] Öffentliche Team-Liste
- [ ] Bewerbungs-Ausschreibungen
- [ ] Role-Selection via Reactions/Buttons
- [ ] Leveling-System erweiterungen

---

## 🐛 Troubleshooting

### Commands werden nicht registriert
```bash
# Bot neu starten
cd bot
node index.js
```

### Twitch Notifications funktionieren nicht
1. Prüfe `.env` - TWITCH_CLIENT_ID und TWITCH_CLIENT_SECRET gesetzt?
2. Erstelle Twitch-App: https://dev.twitch.tv/console/apps
3. Bot neu starten

### Dashboard zeigt keine Daten
1. Prüfe ob Bot API läuft (Port 4301)
2. Prüfe `.env` BOT_API_URL
3. Interface neu starten

---

## 📝 Changelog

### Version 2.0 (Aktuell)
- ✅ 18+ neue Commands
- ✅ Dashboard Verwaltung-Tab
- ✅ Twitch Integration
- ✅ Kummerkasten-System
- ✅ Auto-Nickname-Prefixes
- ✅ Verifizierungs-System
- ✅ Ticket Priority & Forward
- ✅ Projekt-Management
- ✅ Port-Management
- ✅ Warn-System mit Dashboard
- ✅ Report-System mit Dashboard
- ✅ Embed-Builder mit Live-Preview

### Version 1.0
- ✅ Basis Ticket-System
- ✅ Basis Moderation
- ✅ Dashboard Grundfunktionen
- ✅ Team-Verwaltung

---

## 💡 Tipps

- **Admin Panel**: Nur für `thunderflash.0.0.7` zugänglich
- **Twitch API**: Optional - Bot funktioniert auch ohne
- **Backup**: Regelmäßig Config-Backups über Dashboard erstellen
- **Logs**: Log-Channel konfigurieren für Moderation-Tracking
- **Permissions**: Bot benötigt Administrator-Rechte für volles Feature-Set
