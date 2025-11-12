# 🌐 TTH-Bot Dashboard Guide

## Übersicht

Das TTH-Bot Dashboard wurde komplett überarbeitet und bietet jetzt eine moderne, übersichtliche Oberfläche zur Verwaltung deines Discord-Servers.

## 🚀 Zugriff auf das Dashboard

1. **Starte das Web-Interface:**
   ```bash
   node interface/server.js
   ```

2. **Öffne im Browser:**
   ```
   http://localhost:8080
   ```

3. **Login mit Discord:**
   - Klicke auf "Mit Discord anmelden"
   - Autorisiere die Anwendung
   - Du wirst zum Dashboard weitergeleitet

## 📋 Dashboard-Features

### Sidebar (Links)
- **Server-Liste:** Alle Server, in denen du Admin-Rechte hast
- **Active-Highlighting:** Aktuell ausgewählter Server wird hervorgehoben
- **Server-Avatare:** Icons oder Initialen-Platzhalter
- **Bot-Status:** Live-Status des Bots (Online/Offline)

### Header (Oben)
- **Server-Name und Icon:** Großes Banner mit Server-Info
- **Server-ID:** Schnellzugriff auf die ID zum Kopieren
- **Navigation:** Home, Logout Buttons
- **User-Info:** Dein Avatar und Username

### Statistik-Cards (4 Karten)
1. **Gesamt Tickets** 🎫
   - Anzahl aller jemals erstellten Tickets
   - Gradient: Lila → Violett

2. **Offene Tickets** 📂
   - Aktuell noch nicht geschlossene Tickets
   - Gradient: Pink → Rot

3. **Gesamt Bewerbungen** 📄
   - Alle eingegangenen Bewerbungen
   - Gradient: Blau → Cyan

4. **Ausstehende Bewerbungen** ⏱️
   - Bewerbungen im Status "pending"
   - Gradient: Grün → Türkis

## 🎯 Tab-Navigation

### 1. Übersicht 📊
**Funktionen:**
- Konfigurations-Status-Checks
  - ✅ Willkommenssystem konfiguriert?
  - ✅ Ticket-System eingerichtet?
  - ✅ Support-Rolle gesetzt?
  - ✅ Team-Rollen hinzugefügt?
  
- **Quick Start Guide:**
  1. Ticket-System einrichten mit `/setup-tickets`
  2. Willkommenssystem konfigurieren
  3. Team-Rollen hinzufügen mit `/team add-role`
  4. Help-Command testen mit `/help`

- **Letzte Tickets Tabelle:**
  - Ticket-ID (letzte 6 Zeichen)
  - User-ID des Erstellers
  - Ticket-Typ (Badge)
  - Status (Open/Closed Badge)
  - Erstellungsdatum

### 2. Willkommen 👋
**Konfigurationsmöglichkeiten:**
- **Welcome-Channel:**
  - Automatische Erkennung (empfohlen)
  - Sucht nach "willkommen", "welcome", "general"
  - Oder manuelle Channel-Auswahl

- **Custom Welcome-Message:**
  - Verwende `{user}` für User-Erwähnung
  - Leer lassen = 10+ zufällige Standardnachrichten
  - Beispiel: "Willkommen {user} auf unserem Server!"

- **Goodbye-Channel:**
  - Gleicher Channel wie Welcome
  - Oder separater Channel

- **Buttons:**
  - **Speichern:** Einstellungen anwenden
  - **Test-Nachricht:** Preview der Welcome-Message

### 3. Tickets 🎫
**Setup-Anleitung:**
- Verwendung von `/setup-tickets [kategorie] [support-rolle]`
- Ticket-Kategorie auswählen (optional)
- Support-Rolle definieren

**Feature-Übersicht:**
- ✅ Ticket-Ersteller kann selbst schließen
- ✅ Claim-System für Support-Team
- ✅ Ticket-Zuweisung an Team-Mitglieder
- ✅ DM-Benachrichtigungen beim Schließen

**Ticket-Workflow:**
```
User erstellt Ticket
    ↓
Support claimed Ticket (✋)
    ↓
Bearbeitung / Optional: Assign (👤)
    ↓
Ticket schließen (🔒)
    ↓
DM an Ersteller + Channel-Löschung
```

### 4. Team 👥
**Team-Verwaltung:**

**Discord Commands:**
- `/team add-role <rolle> <rang>` - Rolle hinzufügen
- `/team remove-role <rolle>` - Rolle entfernen
- `/team list` - Alle Team-Mitglieder anzeigen
- `/team roles` - Team-Rollen auflisten

**Verfügbare Ränge (7 Typen):**

| Icon | Rang | Beschreibung | Farbe |
|------|------|--------------|-------|
| 👑 | Owner | Server-Besitzer | Gold |
| ⚡ | Admin | Administrator | Gelb |
| 🛡️ | Moderator | Moderation | Blau |
| 💬 | Supporter | Support-Team | Grün |
| 💻 | Developer | Entwickler | Lila |
| ✏️ | Content Creator | Content | Pink |
| ⏱️ | Trial | Probezeit | Grau |

**Visuelles Rang-Grid:**
- Alle 7 Ränge werden als Cards dargestellt
- Hover-Effekt auf den Cards
- Icon, Titel und Beschreibung

**Team-Rollen-Liste:**
- Zeigt Anzahl der konfigurierten Rollen
- Badge mit Count
- Oder Empty State wenn keine Rollen

### 5. Moderation 🛡️
**Command-Übersicht:**

| Command | Berechtigung | Beschreibung |
|---------|--------------|--------------|
| `/ban` | BAN_MEMBERS | Bannt User + DM |
| `/kick` | KICK_MEMBERS | Kickt User + DM |
| `/clear` | MANAGE_MESSAGES | Löscht 1-100 Nachrichten |

**Features:**
- Jeder Command als Card dargestellt
- Farbcodierte Icons (Rot=Ban, Gelb=Kick, Blau=Clear)
- Berechtigungs-Anzeige unter jedem Command
- Hover-Effekt mit Border-Highlighting

**Hinweis:**
Alle Moderations-Aktionen werden automatisch geloggt und sind nachvollziehbar.

## 🎨 Design-Features

### Moderne UI-Elemente
- **Gradient-Backgrounds:** Lila/Violett Theme
- **Card-System:** Alle Inhalte in übersichtlichen Cards
- **Tab-Navigation:** Smooth Transitions zwischen Tabs
- **Hover-Effekte:** Interaktive Elemente reagieren auf Mauszeiger
- **Status-Indikatoren:** Grün=Online, Rot=Offline, Gelb=Pending

### Responsive Design
- **Desktop:** Sidebar links, Content rechts
- **Tablet:** Optimierte Darstellung
- **Mobile:** Stack-Layout, optimierte Touch-Bereiche

### Color Scheme
```css
--discord-blurple: #5865F2  (Hauptfarbe)
--discord-green: #57F287    (Erfolg)
--discord-red: #ED4245      (Fehler/Warnung)
--discord-yellow: #FEE75C   (Info)
--discord-dark: #2C2F33     (Text)
--discord-darker: #23272A   (Hintergründe)
```

### Font Awesome Icons
Alle Icons von Font Awesome 6.4.0:
- `fa-robot` - Bot-Icon
- `fa-server` - Server
- `fa-ticket-alt` - Tickets
- `fa-users` - Team
- `fa-shield-alt` - Moderation
- `fa-hand-wave` - Willkommen
- Und viele mehr...

## 🔧 Konfiguration im Dashboard

### Willkommens-System Setup
1. Wechsel zum Tab "Willkommen"
2. Wähle Channel-Modus:
   - "Automatische Erkennung" (empfohlen)
   - Oder "manuelle Wahl"
3. Optional: Custom Message eingeben
4. "Einstellungen speichern" klicken
5. Optional: "Test-Nachricht" senden

### Ticket-System Setup
1. **Im Discord:**
   ```
   /setup-tickets kategorie:[ticket-kategorie] support_rolle:[Support]
   ```

2. **Im Dashboard:**
   - Wechsel zum Tab "Tickets"
   - Überprüfe Konfiguration
   - Status wird angezeigt

### Team-Rollen Setup
1. **Im Discord:**
   ```
   /team add-role rolle:@Moderator rang:Moderator
   /team add-role rolle:@Support rang:Supporter
   ```

2. **Im Dashboard:**
   - Wechsel zum Tab "Team"
   - Sieh alle Ränge als Grid
   - Count der konfigurierten Rollen

## 🎯 Status-Checks

### Konfigurations-Übersicht
Im "Übersicht"-Tab siehst du sofort:

✅ **Vollständig konfiguriert:**
- Grüner Haken
- System ist eingerichtet

❌ **Noch nicht konfiguriert:**
- Roter X
- System muss noch eingerichtet werden

### Quick Info (Sidebar unten)
- **Bot Status:** Online ● / Offline ○
- Wird live aktualisiert

## 📊 Statistiken

### Ticket-Statistiken
- **Total Tickets:** Alle jemals erstellten
- **Open Tickets:** Aktuell offene
- Wird automatisch aus der Datenbank geladen

### Bewerbungs-Statistiken
- **Total Applications:** Alle Bewerbungen
- **Pending:** Noch nicht bearbeitet
- Wird automatisch berechnet

### Server-Info
- **Server-Name:** Dynamisch vom Bot
- **Server-ID:** Zum Kopieren
- **Server-Icon:** Oder Platzhalter mit Initiale

## 🔐 Sicherheit

### OAuth2 Login
- Sichere Discord-OAuth2-Integration
- Passport.js für Session-Management
- Nur Admins können Server verwalten

### Berechtigungs-Checks
- Dashboard prüft Admin-Rechte
- Nur deine Server werden angezeigt
- Keine Zugriff auf fremde Server

### Session-Management
- Sessions werden sicher gespeichert
- Automatisches Logout bei Inaktivität
- Jederzeit manuell ausloggen

## ❓ Häufige Fragen

### Das Dashboard lädt nicht?
1. Stelle sicher, dass `interface/server.js` läuft
2. Überprüfe Port 8080 ist frei
3. Check Console auf Fehler

### Server werden nicht angezeigt?
1. Stelle sicher, du bist Admin auf dem Server
2. Bot muss auf dem Server sein
3. Neu einloggen versuchen

### OAuth-Fehler?
1. Überprüfe CLIENT_SECRET in `.env`
2. Redirect URI muss in Discord Portal stehen
3. Siehe `OAUTH_SETUP.md` für Details

### Statistiken zeigen 0?
1. Normal bei neuen Servern
2. Erstelle ein paar Tickets zum Testen
3. Datenbank-Verbindung prüfen

## 🎉 Features Summary

✅ **Implementiert:**
- Modernes Discord-Theme Design
- 5 Tab-Navigation (Übersicht, Willkommen, Tickets, Team, Moderation)
- Live-Statistiken mit 4 Cards
- Server-Sidebar mit Avataren
- Responsive Mobile-Design
- Status-Indikatoren
- Konfigurations-Formulare
- Quick Start Guide
- Team-Rang-System (7 Ränge)
- Ticket-Feature-Übersicht
- Moderations-Command-Cards

⏳ **Zukünftig:**
- API-Endpoints für Form-Submissions
- Live-Updates ohne Reload
- Erweiterte Statistiken
- User-Management im Dashboard
- Log-Viewer für Moderations-Aktionen

## 🚀 Nächste Schritte

1. **Dashboard testen:**
   - Einloggen mit Discord
   - Jeden Tab durchgehen
   - Statistiken überprüfen

2. **Features nutzen:**
   - Willkommen-System konfigurieren
   - Ticket-System im Discord einrichten
   - Team-Rollen hinzufügen
   - Moderation testen

3. **Feedback geben:**
   - Was gefällt dir?
   - Was fehlt noch?
   - Welche Features wünschst du?

**Das Dashboard ist jetzt vollständig funktional und optisch auf dem neuesten Stand!** 🎉
