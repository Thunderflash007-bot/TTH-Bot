# 🔧 PM2 Problembehebung

## Problem: PM2 startet, aber Bot/Interface läuft nicht

### Schnelle Diagnose

```bash
npm run check
```

Dies zeigt:
- ✅/❌ Welche Dateien fehlen (.env, config.json)
- ✅/❌ PM2 Status
- ✅/❌ Ports (3000, 5000)
- 📝 Letzte Fehler

---

## Lösungen

### Option 1: PM2 komplett neu starten

```bash
# Stoppe alles
pm2 delete all

# Starte neu
pm2 start ecosystem.config.js

# Zeige Status
pm2 status

# Zeige Logs
pm2 logs
```

Oder kurz:
```bash
npm run pm2:reset
```

### Option 2: Direktstart ohne PM2

Wenn PM2 Probleme macht:

```bash
node simple-start.js
```

Oder:
```bash
npm run simple
```

Dies startet Bot und Interface direkt im Terminal.

### Option 3: Manuell einzeln starten

```bash
# Terminal 1 - Bot
npm start

# Terminal 2 - Interface
npm run interface
```

---

## Häufige Probleme

### 1. "Port already in use"

**Problem:** Port 3000 oder 5000 ist bereits belegt

**Lösung:**
```bash
# Finde Prozess
lsof -i :3000
lsof -i :5000

# Oder mit PM2
pm2 delete all

# Neu starten
pm2 start ecosystem.config.js
```

### 2. Bot verbindet sich nicht zu Discord

**Problem:** Token fehlt oder falsch

**Lösung:**
```bash
# Prüfe bot/config.json
cat bot/config.json

# Token muss gesetzt sein und nicht "DEIN_BOT_TOKEN"
```

Korrigiere in `bot/config.json`:
```json
{
  "token": "DEIN_ECHTER_DISCORD_BOT_TOKEN",
  "clientId": "DEINE_CLIENT_ID",
  "apiPort": 5000
}
```

### 3. Interface lädt nicht

**Problem:** OAuth nicht konfiguriert

**Lösung:**
Prüfe `.env`:
```env
CLIENT_ID=deine_discord_client_id
CLIENT_SECRET=dein_discord_client_secret
OAUTH_CALLBACK_URL=http://localhost:3000/auth/callback
SESSION_SECRET=ein_zufälliger_string
```

### 4. PM2 zeigt "errored" Status

**Problem:** Code-Fehler beim Start

**Lösung:**
```bash
# Zeige detaillierte Fehler
pm2 logs tth-bot --err --lines 50

# Oder prüfe Log-Dateien
cat logs/bot-error.log
cat logs/interface-error.log
```

### 5. Prozesse starten nicht automatisch

**Problem:** PM2 Autorestart deaktiviert

**Lösung:**
```bash
# Aktiviere Autorestart
pm2 start ecosystem.config.js --update-env

# Speichere Konfiguration
pm2 save

# Optional: PM2 bei Systemstart
pm2 startup
```

---

## Log-Dateien

Fehler werden hier gespeichert:
- `logs/bot-error.log` - Bot Fehler
- `logs/bot-out.log` - Bot Output
- `logs/interface-error.log` - Interface Fehler
- `logs/interface-out.log` - Interface Output

Logs anzeigen:
```bash
# Alle Logs
pm2 logs

# Nur Fehler
pm2 logs --err

# Nur einen Prozess
pm2 logs tth-bot
pm2 logs tth-interface

# Letzte 50 Zeilen
pm2 logs --lines 50

# Echtzeit folgen
pm2 logs --raw
```

---

## PM2 Befehle Übersicht

```bash
# Status
pm2 status
pm2 list

# Starten
pm2 start ecosystem.config.js
pm2 start bot/index.js --name tth-bot

# Stoppen
pm2 stop tth-bot
pm2 stop all

# Neu starten
pm2 restart tth-bot
pm2 restart all

# Löschen
pm2 delete tth-bot
pm2 delete all

# Logs
pm2 logs
pm2 logs tth-bot --lines 100
pm2 flush  # Logs leeren

# Monitoring
pm2 monit

# Infos
pm2 show tth-bot
pm2 describe tth-bot
```

---

## Entwicklung vs. Produktion

### Entwicklung (mit Auto-Reload)
```bash
npm run dev        # Bot mit nodemon
npm run dev:interface  # Interface mit nodemon
npm run dev:all    # Beide gleichzeitig
```

### Produktion (mit PM2)
```bash
npm run pm2:start  # Starten
npm run pm2:status # Status
npm run pm2:logs   # Logs
npm run pm2:restart # Neu starten
npm run pm2:stop   # Stoppen
```

---

## Checkliste vor dem Start

- [ ] `.env` Datei existiert und ist ausgefüllt
- [ ] `bot/config.json` hat echten Token
- [ ] `npm install` wurde ausgeführt
- [ ] Ports 3000 und 5000 sind frei
- [ ] Discord Bot ist in Servern eingeladen
- [ ] Bot hat richtige Permissions

---

## Support

Wenn nichts funktioniert:

1. **Führe Diagnose aus:**
   ```bash
   npm run check
   ```

2. **Prüfe alle Logs:**
   ```bash
   pm2 logs --lines 100
   cat logs/*.log
   ```

3. **Teste einzeln:**
   ```bash
   node bot/index.js
   # Dann in anderem Terminal:
   node interface/server.js
   ```

4. **Komplett neu:**
   ```bash
   pm2 delete all
   pm2 kill
   pm2 start ecosystem.config.js
   ```
