# 🚀 Quick Start Guide - Bot neu starten

## ✅ Was wurde implementiert?

### Neue Commands: **28 Commands** insgesamt
### Neue Models: **11 Models** (4 neu hinzugefügt)
### Dashboard: **Verwaltung-Tab** mit 3 Sections
### Bot API: **11 neue Endpoints**

---

## 📝 Schritt-für-Schritt Anleitung

### 1. Bot stoppen (falls läuft)
```bash
# Wenn Bot im Terminal läuft: Strg+C
# Oder finde den Prozess:
ps aux | grep "node.*bot/index.js"
kill <PID>
```

### 2. Bot neu starten
```bash
cd /workspaces/TTH-Bot/bot
node index.js
```

**Erwartete Ausgabe:**
```
✅ JSON-Datenbank initialisiert
✅ Commands geladen
✅ Events geladen
✅ Components geladen
✅ Bot ist online als TTH-Bot#1234
✅ Bot API läuft auf Port 4301
✅ Message Scheduler gestartet
✅ Twitch Stream Checker gestartet
```

### 3. Interface neu starten (falls nötig)
```bash
cd /workspaces/TTH-Bot/interface
node server.js
```

---

## 🧪 Teste die neuen Features

### In Discord:

#### 1. Moderation testen
```
/warn @user Testreason
/warns @user
/unwarn <warn-id>
```

#### 2. Projekt-Management testen
```
/projekt create name:TestProjekt ip:127.0.0.1
```
→ Erstellt automatisch Kategorie, Channels, VC, Rolle!

#### 3. Twitch testen
```
/twitch add username:shroud channel:#streams
```
→ Bot checkt alle 2 Min ob shroud live ist

#### 4. Kummerkasten testen
```
/kummerkasten
```
→ Modal öffnet sich, anonyme Nachricht senden

#### 5. Verifizierung testen
```
/verify-setup passcode:test123 rolle:@Member
/verify passcode:test123
```

#### 6. Auto-Prefixes testen
```
/prefix add rolle:@Partner prefix:[Partner]
```
→ Alle Partner bekommen automatisch [Partner] vor dem Namen

#### 7. Vorschläge testen
```
/vorschlag beschreibung:Neues Feature XYZ
```
→ Erstellt Thread mit 👍👎🤷 Reactions

---

## 🖥️ Dashboard testen

### 1. Öffne Dashboard
```
https://nodes.c4g7.com:4300
```

### 2. Verwaltung-Tab öffnen
- Klicke auf **"Verwaltung"**
- Siehst du 3 Sections:
  - ✅ **Warns Management** (gruppiert nach User)
  - ✅ **Reports Management** (mit Type-Indicators)
  - ✅ **Embed Builder** (mit Live-Preview)

### 3. Embed Builder testen
- Fülle das Formular aus
- Siehst du Live-Preview rechts?
- Wähle Channel
- Klicke "Embed senden"
- Prüfe ob Embed in Discord erscheint

---

## ⚙️ Twitch API einrichten (optional)

### Nur wenn du Stream-Notifications nutzen willst:

#### 1. Twitch App erstellen
1. Gehe zu: https://dev.twitch.tv/console/apps
2. Klicke "Register Your Application"
3. Name: `TTH-Bot`
4. OAuth Redirect URLs: `http://localhost`
5. Category: `Application Integration`
6. Erstelle App

#### 2. Credentials kopieren
- Client ID kopieren
- "New Secret" erstellen und kopieren

#### 3. In .env eintragen
```bash
nano /workspaces/TTH-Bot/.env
```

Füge hinzu:
```env
TWITCH_CLIENT_ID=deine_client_id_hier
TWITCH_CLIENT_SECRET=dein_secret_hier
```

#### 4. Bot neu starten
```bash
cd /workspaces/TTH-Bot/bot
node index.js
```

Du siehst jetzt:
```
✅ Twitch Stream Checker gestartet
```

Ohne Twitch API siehst du:
```
⚠️ Twitch API credentials fehlen in .env
```

---

## ✅ Checkliste

### Commands registriert?
- [ ] Tippe `/` in Discord
- [ ] Siehst du alle neuen Commands?
  - `/warn`, `/warns`, `/unwarn`
  - `/report`
  - `/news`, `/projekt`, `/port`
  - `/priority`, `/forward`
  - `/twitch`, `/vorschlag`, `/kummerkasten`
  - `/verify-setup`, `/verify`
  - `/prefix`

### Dashboard funktioniert?
- [ ] Dashboard öffnet sich
- [ ] Verwaltung-Tab sichtbar
- [ ] Warns-Section lädt Daten
- [ ] Reports-Section lädt Daten
- [ ] Embed-Builder zeigt Preview

### Bot-Features funktionieren?
- [ ] `/warn` sendet DM an User
- [ ] `/projekt create` erstellt komplettes Setup
- [ ] `/kummerkasten` öffnet Modal
- [ ] `/prefix add` funktioniert
- [ ] Nickname ändert sich bei Rollenwechsel

---

## 🐛 Troubleshooting

### Commands werden nicht angezeigt
**Problem:** Keine Slash-Commands in Discord
**Lösung:**
```bash
# Bot neu starten
cd /workspaces/TTH-Bot/bot
node index.js

# Warte 1-2 Minuten (Discord Cache)
# Dann tippe / in einem Channel
```

### Dashboard zeigt keine Daten
**Problem:** API-Verbindung fehlgeschlagen
**Lösung:**
```bash
# Prüfe ob Bot API läuft:
curl http://localhost:4301/api/health

# Sollte zurückgeben: {"status":"ok"}

# Falls nicht, Bot neu starten
```

### Twitch Notifications funktionieren nicht
**Problem:** Stream-Checker läuft nicht
**Lösung:**
```bash
# Prüfe .env:
cat /workspaces/TTH-Bot/.env | grep TWITCH

# Sollte zeigen:
# TWITCH_CLIENT_ID=...
# TWITCH_CLIENT_SECRET=...

# Falls leer, siehe "Twitch API einrichten" oben
```

### Auto-Prefixes funktionieren nicht
**Problem:** Nickname wird nicht geändert
**Lösung:**
- Bot benötigt Permission: "Manage Nicknames"
- Bot-Rolle muss ÜBER den User-Rollen sein (Hierarchie)
- User darf nicht Server-Owner sein (Owner-Nickname nicht änderbar)

### Kummerkasten erstellt keine Threads
**Problem:** Thread-Erstellung schlägt fehl
**Lösung:**
- Bot benötigt Permission: "Create Public Threads"
- Channel muss Thread-fähig sein (Text Channel)
- Prüfe Kummerkasten-Setup: `/kummerkasten-setup`

---

## 📞 Support

### Logs prüfen
```bash
# Bot-Logs
cd /workspaces/TTH-Bot/bot
node index.js

# Interface-Logs
cd /workspaces/TTH-Bot/interface
node server.js
```

### Datenbank prüfen
```bash
# Warnings anzeigen
cat /workspaces/TTH-Bot/data/warnings.json

# Reports anzeigen
cat /workspaces/TTH-Bot/data/reports.json

# Config anzeigen
cat /workspaces/TTH-Bot/data/guildconfigs.json
```

---

## 🎉 Fertig!

Alle Features sind implementiert und sollten jetzt funktionieren!

### Nächste Schritte:
1. ✅ Bot gestartet?
2. ✅ Commands getestet?
3. ✅ Dashboard getestet?
4. ✅ Alles funktioniert?

**→ Dann bist du ready to go! 🚀**

---

## 📚 Weitere Dokumentation

- **Alle Features:** `/workspaces/TTH-Bot/COMPLETE_FEATURES.md`
- **Implementierungs-Details:** `/workspaces/TTH-Bot/IMPLEMENTATION_SUMMARY.md`
- **Setup Guide:** `/workspaces/TTH-Bot/SETUP_GUIDE.md`
