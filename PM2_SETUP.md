# PM2 Setup Guide für TTH-Bot

## Was ist PM2?

PM2 ist ein Production Process Manager für Node.js-Anwendungen mit:
- ✅ **Automatische Neustarts** bei Abstürzen oder via Admin-Panel
- ✅ **Log-Management** mit automatischer Rotation
- ✅ **Monitoring** von CPU/RAM-Nutzung
- ✅ **Cluster-Modus** für bessere Performance
- ✅ **Auto-Start** beim Server-Neustart

## Installation

```bash
# PM2 global installieren
npm install -g pm2

# Version prüfen
pm2 --version
```

## Bot mit PM2 starten

### Option 1: Mit Ecosystem Config (Empfohlen)

```bash
# Beide Services starten (Bot + Interface)
npm run pm2:start

# Status prüfen
npm run pm2:status

# Logs anzeigen
npm run pm2:logs

# Neustarten
npm run pm2:restart

# Stoppen
npm run pm2:stop
```

### Option 2: Manuell

```bash
# Bot starten
pm2 start bot/index.js --name tth-bot

# Interface starten
pm2 start interface/server.js --name tth-interface

# Status anzeigen
pm2 status

# Logs anzeigen
pm2 logs tth-bot

# Beide neustarten
pm2 restart all

# Nur Bot neustarten
pm2 restart tth-bot
```

## Auto-Start beim Server-Neustart

```bash
# Startup-Script generieren (einmalig)
pm2 startup

# Aktuelle Prozess-Liste speichern
pm2 save

# Jetzt starten Bot & Interface automatisch beim Server-Neustart!
```

## Wichtige PM2 Befehle

```bash
# Status aller Prozesse
pm2 status

# Logs live anzeigen
pm2 logs

# Logs nur vom Bot
pm2 logs tth-bot

# Logs löschen
pm2 flush

# Prozess-Details
pm2 show tth-bot

# Monitoring Dashboard
pm2 monit

# Prozess stoppen
pm2 stop tth-bot

# Prozess löschen
pm2 delete tth-bot

# Alle Prozesse löschen
pm2 delete all

# PM2 komplett zurücksetzen
pm2 kill
```

## Admin-Panel Integration

Wenn der Bot mit PM2 läuft, funktioniert der **"Bot Neustarten"**-Button im Admin-Panel automatisch:

1. ✅ PM2 erkennt den Exit-Code
2. ✅ PM2 startet Bot automatisch neu
3. ✅ Bot ist nach ~2-3 Sekunden wieder online

**Ohne PM2**: Der Restart-Button verwendet das `restart.sh` Script als Fallback.

## Ecosystem Config

Die Datei `ecosystem.config.js` definiert beide Services:

```javascript
module.exports = {
  apps: [
    {
      name: 'tth-bot',
      script: './bot/index.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M'
    },
    {
      name: 'tth-interface',
      script: './interface/server.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M'
    }
  ]
};
```

## Logs

PM2 speichert Logs automatisch in:
- `/root/.pm2/logs/tth-bot-error.log` - Fehler
- `/root/.pm2/logs/tth-bot-out.log` - Standard Output

Mit der Config werden Logs auch in `./logs/` gespeichert.

## Troubleshooting

### PM2 Command not found
```bash
# PM2 erneut installieren
npm install -g pm2

# PATH prüfen
echo $PATH

# PM2 Location finden
which pm2
```

### Bot startet nicht
```bash
# Logs prüfen
pm2 logs tth-bot --err

# Prozess-Details anzeigen
pm2 show tth-bot

# Prozess löschen und neu starten
pm2 delete tth-bot
pm2 start ecosystem.config.js
```

### Zu viel RAM-Verbrauch
```bash
# Max Memory im ecosystem.config.js anpassen
max_memory_restart: '300M'  # Weniger RAM

# Bot neu laden
pm2 reload tth-bot
```

## Production Best Practices

1. **Immer PM2 in Production verwenden**
   ```bash
   npm run pm2:start
   ```

2. **Auto-Startup konfigurieren**
   ```bash
   pm2 startup
   pm2 save
   ```

3. **Logs regelmäßig checken**
   ```bash
   pm2 logs --lines 100
   ```

4. **Monitoring aktivieren**
   ```bash
   pm2 monit
   ```

5. **Backups vor Updates**
   ```bash
   pm2 save
   ```

## Migration von `npm start` zu PM2

Aktuell läuft:
```bash
npm start  # Bot
npm run interface  # Interface
```

Mit PM2:
```bash
npm run pm2:start  # Beide gleichzeitig
```

**Vorteile:**
- ✅ Restart-Button funktioniert
- ✅ Logs persistiert
- ✅ Auto-Restart bei Crash
- ✅ Monitoring
- ✅ Auto-Start nach Server-Neustart

## Weitere Ressourcen

- [PM2 Dokumentation](https://pm2.keymetrics.io/)
- [PM2 Ecosystem File](https://pm2.keymetrics.io/docs/usage/application-declaration/)
- [PM2 Cluster Mode](https://pm2.keymetrics.io/docs/usage/cluster-mode/)
