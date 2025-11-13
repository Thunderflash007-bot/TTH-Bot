# 🛡️ Globale Feature-Verwaltung - Admin Control System

## 📋 Übersicht

Das globale Feature-Verwaltungs-System ermöglicht es dir als Admin, einzelne Bot-Features für **ALLE Server gleichzeitig** zu deaktivieren/aktivieren. Perfekt für Bug-Fixes, Wartungsarbeiten oder wenn ein Feature Probleme macht.

## 🎯 Features

### 1. **Wartungsmodus** 🔧
- Deaktiviert **ALLE** Bot-Funktionen auf **ALLEN** Servern
- Eigene Nachricht für User konfigurierbar
- Admin (thunderflash.0.0.7) bleibt ausgenommen
- Ein-Klick-Aktivierung/Deaktivierung

### 2. **Einzelne Feature-Toggles** 🎚️
- Jedes Feature kann individuell deaktiviert werden
- Grund-Angabe (wird Usern angezeigt)
- Kategorisiert nach Funktionsbereichen
- Live-Status-Anzeige

## 🗂️ Feature-Kategorien

### 🎫 Ticket-System
- `tickets` - Grundlegendes Ticket-System
- `ticketPriority` - Ticket-Prioritäten (🟢🟠🔴)
- `ticketForward` - Ticket-Weiterleitung

### 🛡️ Moderation
- `warns` - Warn-System (/warn, /warns, /unwarn)
- `reports` - Report-System (/report user/message)
- `ban` - Ban-Command
- `kick` - Kick-Command
- `clear` - Clear Messages

### 🎮 Projekte & Verwaltung
- `projects` - Projekt-Management (/projekt)
- `ports` - Port-Verwaltung (/port)
- `news` - News-System (/news)

### 💬 Kommunikation
- `twitch` - Twitch Stream Notifications
- `vorschlag` - Vorschläge-System
- `kummerkasten` - Anonymer Chat

### ✅ Verifizierung & Rollen
- `verify` - Verifizierungs-System
- `prefix` - Auto-Nickname-Prefixes

### 🤖 Automation
- `scheduledMessages` - Geplante Nachrichten
- `autoRoles` - Auto-Rollen
- `customCommands` - Custom Commands

### 📊 Dashboard
- `dashboard` - Web-Dashboard-Zugriff

## 🚀 Verwendung

### Admin-Panel öffnen

1. Gehe zu: `https://nodes.c4g7.com:4300/admin/secret-control-panel-x7k9m2p`
2. Nur **thunderflash.0.0.7** hat Zugriff
3. Scrolle zu **"Globale Feature-Verwaltung"**

### Wartungsmodus aktivieren

1. **Nachricht eingeben** (optional):
   ```
   Der Bot wird gewartet. Zurück in ca. 30 Minuten!
   ```

2. **"Wartungsmodus aktivieren"** klicken

3. **Bestätigen** - Alle Features werden sofort deaktiviert

4. **Zum Beenden**: Nochmal klicken → "Wartungsmodus AKTIV - Deaktivieren"

### Einzelnes Feature deaktivieren

1. Finde das Feature in der Liste (z.B. "⚠️ Warn-System")

2. Klicke auf **"Deaktivieren"**

3. **Grund eingeben** (wird Usern angezeigt):
   ```
   Bug beim Auto-Ban - wird behoben
   ```

4. **OK** - Feature ist sofort deaktiviert

5. **Zum Aktivieren**: Klicke auf "Aktivieren" (kein Grund nötig)

## 📱 User-Experience

### Wenn Feature deaktiviert ist:

User sieht beim Command-Aufruf:

```
┌─────────────────────────────────┐
│ ❌ Feature deaktiviert          │
├─────────────────────────────────┤
│ Das Warn-System ist derzeit     │
│ deaktiviert.                    │
│                                 │
│ Grund: Bug beim Auto-Ban -      │
│        wird behoben             │
│                                 │
│ Kontaktiere einen Administrator │
└─────────────────────────────────┘
```

### Im Wartungsmodus:

```
┌─────────────────────────────────┐
│ 🔧 Wartungsmodus                │
├─────────────────────────────────┤
│ Der Bot wird gewartet.          │
│ Zurück in ca. 30 Minuten!       │
│                                 │
│ Bitte versuche es später erneut │
└─────────────────────────────────┘
```

## 🔧 Technische Details

### Datenspeicherung

Alle Einstellungen werden in `/data/globalsettings.json` gespeichert:

```json
{
  "id": "global",
  "maintenanceMode": false,
  "maintenanceMessage": "...",
  "features": {
    "warns": {
      "enabled": true,
      "reason": ""
    },
    "twitch": {
      "enabled": false,
      "reason": "API-Probleme - wird behoben"
    }
  },
  "updatedAt": "2025-11-13T...",
  "updatedBy": "465490004601151498"
}
```

### Feature-Checks

1. **Globaler Check** in `interactionCreate.js`:
   - Wartungsmodus → Alle Commands blockiert
   - Admin ausgenommen

2. **Feature-spezifischer Check** in Commands:
   ```javascript
   const GlobalSettings = require('../../models/GlobalSettings');
   
   if (!GlobalSettings.isFeatureEnabled('warns')) {
       // Zeige Fehler-Embed
       return;
   }
   ```

### API-Endpoints

**Bot API (Port 4301):**
- `GET /api/admin/global-settings` - Einstellungen abrufen
- `PATCH /api/admin/global-settings/feature/:name` - Feature togglen
- `POST /api/admin/maintenance` - Wartungsmodus ändern

**Interface API (Port 4300):**
- `GET /admin/api/global-settings` - Proxy zu Bot API
- `PATCH /admin/api/global-settings/feature/:name` - Proxy
- `POST /admin/api/maintenance` - Proxy

## 🎯 Use-Cases

### 1. Bug gefunden

```
Feature: "warns" deaktivieren
Grund: "Auto-Ban bei 5 Warns funktioniert nicht - wird gefixt"
→ User können /warn nicht mehr nutzen
→ Keine falschen Bans mehr
→ Nach Fix: Wieder aktivieren
```

### 2. API-Problem

```
Feature: "twitch" deaktivieren
Grund: "Twitch API temporär nicht erreichbar"
→ Keine Error-Messages für User
→ API wieder online? → Aktivieren
```

### 3. Große Wartungsarbeiten

```
Wartungsmodus: EIN
Nachricht: "Bot-Update läuft - zurück in 15 Min"
→ Alle Commands blockiert
→ Update durchführen
→ Wartungsmodus: AUS
```

### 4. Dashboard-Problem

```
Feature: "dashboard" deaktivieren
Grund: "Dashboard wird aktualisiert - bitte warten"
→ User können sich nicht einloggen
→ Update fertig? → Aktivieren
```

## 📊 Monitoring

### Im Admin-Panel sichtbar:

- ✅/❌ **Status** jedes Features (grün/rot)
- 📝 **Deaktivierungs-Grund**
- ⏰ **Letztes Update** (wann geändert)
- 👤 **Geändert von** (User-ID)

### Live-Updates:

- Änderungen sind **sofort wirksam**
- Keine Bot-Neustart nötig
- User sehen sofort die neue Message

## ⚠️ Wichtige Hinweise

### Admin-Ausnahme

- **thunderflash.0.0.7** ist vom Wartungsmodus **ausgenommen**
- Alle Commands funktionieren weiterhin
- Wichtig zum Testen/Debuggen

### Sofortige Wirkung

- Feature deaktiviert → **Sofort** für alle Server
- Keine Verzögerung
- User sehen beim nächsten Command-Aufruf die Nachricht

### Dashboard bleibt erreichbar

- Admin-Panel ist immer zugänglich
- Auch im Wartungsmodus
- Zum An/Ausschalten

## 🚨 Notfall-Prozedur

Wenn Bot komplett kaputt ist:

1. **Wartungsmodus aktivieren**
2. **Nachricht**: "Technische Probleme - wird behoben"
3. **Bug fixen**
4. **Bot neustarten** (falls nötig)
5. **Wartungsmodus deaktivieren**

Wenn einzelnes Feature kaputt ist:

1. **Nur dieses Feature deaktivieren**
2. **Grund angeben**
3. **Fix implementieren**
4. **Testen**
5. **Feature wieder aktivieren**

## 📈 Best Practices

### Gute Gründe angeben

❌ Schlecht: "geht nicht"
✅ Gut: "Bug beim Auto-Ban - wird innerhalb 1h behoben"

### Zeitangaben

✅ "Zurück in ca. 30 Minuten"
✅ "Kurze Wartung - max. 15 Min"
✅ "Update läuft - zurück um 14:00 Uhr"

### Proaktiv kommunizieren

- Ankündigen **bevor** Features deaktiviert werden
- In Discord-Ankündigungen posten
- Zeitrahmen nennen

## 🎨 Dashboard-Design

### Wartungsmodus-Sektion

- Roter Gradient-Header
- Große auffällige Buttons
- Status sofort erkennbar

### Feature-Liste

- Nach Kategorien gruppiert
- Farbcodierte Status (grün/rot)
- Border-Left in Statusfarbe
- Grund direkt sichtbar wenn deaktiviert

### Interaktivität

- Confirm-Dialoge bei wichtigen Aktionen
- Prompt für Deaktivierungs-Grund
- Live-Reload nach Änderungen

---

**Status**: ✅ Vollständig implementiert und einsatzbereit!

**Zugriff**: Nur Admin (thunderflash.0.0.7)

**URL**: `https://nodes.c4g7.com:4300/admin/secret-control-panel-x7k9m2p`
