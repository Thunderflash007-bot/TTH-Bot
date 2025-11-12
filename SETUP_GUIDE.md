# Web-Interface OAuth Setup

## ⚠️ WICHTIG: CLIENT_SECRET benötigt

Das Web-Interface benötigt ein **CLIENT_SECRET** für Discord OAuth2.

### So erhältst du das CLIENT_SECRET:

1. Gehe zum **Discord Developer Portal**: https://discord.com/developers/applications
2. Wähle deine Application aus (TTH-Bot)
3. Gehe zu **OAuth2** → **General**
4. Klicke auf **Reset Secret** (falls noch keins vorhanden) oder kopiere das bestehende Secret
5. **WICHTIG**: Speichere das Secret sofort - es wird nur einmal angezeigt!

### OAuth2 Redirect URLs hinzufügen:

Im gleichen Menü unter **Redirects**:
- Füge hinzu: `http://localhost:8080/auth/discord/callback`
- Für Production: `https://deine-domain.de/auth/discord/callback`

### .env aktualisieren:

Öffne die Datei `/workspaces/TTH-Bot/.env` und füge das Secret ein:

```env
CLIENT_SECRET=DEIN_CLIENT_SECRET_HIER
```

### Danach das Interface neu starten:

```bash
node interface/server.js
```

Das Interface läuft dann auf: http://localhost:8080

## 🎯 Neue Features - Zusammenfassung

### ✅ Komplett überarbeitetes Ticket-System
- Moderne, schöne Embeds mit Thumbnails und Farben
- Automatische Support-Rollen-Benachrichtigung
- Detaillierte Ticket-Informationen (ID, Zeitstempel, etc.)
- Schließen mit Grund + DM an Ticket-Ersteller
- Kategorie-Auswahl beim Setup

### ✅ Team-Rollen-System (`/team`)
- `/team add-role` - Fügt Team-Rollen hinzu mit Rängen:
  - 👑 Owner
  - ⚡ Admin
  - 🛡️ Moderator
  - 💬 Supporter
  - 🎨 Developer
  - 📝 Content Creator
  - 🎯 Trial
  
- `/team remove-role` - Entfernt Team-Rollen
- `/team roles` - Zeigt alle Team-Rollen
- `/team list` - Zeigt ALLE Team-Mitglieder mit ihren Rängen sortiert!

### ✅ Verbessertes Welcome/Goodbye-System
- 10 verschiedene zufällige Willkommensnachrichten
- 8 verschiedene Goodbye-Nachrichten
- Automatische Channel-Erkennung (funktioniert OHNE Config!)
- Schöne Embeds mit Account-Alter, Mitgliedsnummer, etc.

### ✅ Modernisierte Commands
- `/userinfo` - Mit Badges, Status, Rang, Banner
- `/serverinfo` - Detaillierte Server-Stats
- `/level` - Visueller Fortschrittsbalken, Rang-System
- `/ban` & `/kick` - Mit DM-Benachrichtigung, Case-IDs
- `/setup-tickets` - Erweitert mit Kategorie + Support-Rolle

### ✅ Web-Interface
- Moderne Homepage mit Feature-Cards
- Dashboard mit Server-Auswahl
- Animationen und Discord-Design
- Responsive Layout

## 🚀 Commands Übersicht

### Moderation
- `/ban <user> [grund]` - Bannt einen User
- `/kick <user> [grund]` - Kickt einen User
- `/clear <anzahl>` - Löscht Nachrichten

### Tickets
- `/setup-tickets [kategorie] [support-rolle]` - Richtet Ticket-System ein
- `/close [grund]` - Schließt ein Ticket

### Team-Management
- `/team add-role <rolle> <rang>` - Fügt Team-Rolle hinzu
- `/team remove-role <rolle>` - Entfernt Team-Rolle
- `/team roles` - Zeigt Team-Rollen
- `/team list` - Zeigt alle Team-Mitglieder

### Utility
- `/userinfo [user]` - User-Informationen
- `/serverinfo` - Server-Informationen
- `/level [user]` - Level & XP anzeigen

### Config
- `/config` - Server-Konfiguration
- `/welcome-setup` - Willkommens-System einrichten
