# Admin-Rechteverwaltung & Live-Wartungsmodus

## ✨ Neue Features

### 1. 🔄 Live-Wartungsmodus mit Socket.IO

**Problem gelöst:** Wenn der Wartungsmodus aktiviert wird, wurden User ohne Bypass nicht automatisch ausgeloggt oder informiert.

**Lösung:**
- Socket.IO Integration für Echtzeit-Updates
- Alle aktiven Dashboard-Sessions werden automatisch benachrichtigt
- Seite lädt sich nach 2 Sekunden automatisch neu
- User ohne Bypass landen auf der Wartungsseite
- User mit Bypass behalten Zugriff

**Implementierung:**
- Server: `/interface/server.js` - Socket.IO Server
- Views: Socket.IO Client in `admin.ejs`, `dashboard.ejs`, `maintenance.ejs`
- Broadcast-Funktion: `global.notifyMaintenanceMode(enabled)`

### 2. 👥 Admin-User-Verwaltung mit Granularen Berechtigungen

**Problem gelöst:** Nur ein Haupt-Admin konnte das Admin-Panel nutzen. Keine Möglichkeit, weitere Admins mit eingeschränkten Rechten hinzuzufügen.

**Lösung:**
- Neue AdminUser-Verwaltung im Admin-Panel (nur für Haupt-Admin)
- Granulare Berechtigungen für jeden Admin-User
- Admin-User können per User-ID hinzugefügt werden
- Berechtigungen können individuell aktiviert/deaktiviert werden

## 🔐 Berechtigungssystem

### Admin-Typen

1. **Haupt-Admin** (User-ID: `901518853635444746`)
   - Hat alle Berechtigungen
   - Kann Admin-User hinzufügen/entfernen
   - Kann nicht aus der Admin-Liste entfernt werden

2. **Admin-User**
   - Werden vom Haupt-Admin hinzugefügt
   - Haben nur die zugewiesenen Berechtigungen
   - Sehen nur die Bereiche, für die sie Rechte haben

### Verfügbare Berechtigungen

#### 🤖 Bot Verwaltung
- `viewBotStatus` - Bot-Status anzeigen
- `restartBot` - Bot neustarten
- `manageCommands` - Commands verwalten
- `viewLogs` - Bot-Logs anzeigen

#### 🔧 Wartung & Features
- `toggleMaintenance` - Wartungsmodus umschalten
- `toggleFeatures` - Features aktivieren/deaktivieren
- `manageBypass` - Bypass-User verwalten

#### 👤 User Verwaltung
- `searchUsers` - User suchen
- `viewUserStats` - User-Statistiken anzeigen

#### 💾 Datenbank
- `createBackup` - Backups erstellen
- `viewBackups` - Backups anzeigen
- `cleanupDatabase` - Datenbank bereinigen

#### 📢 Kommunikation
- `sendAnnouncements` - Wartungsankündigungen senden
- `sendBroadcast` - Global Broadcast senden

#### 🐛 Bug Reports
- `viewBugReports` - Bug Reports anzeigen
- `manageBugReports` - Bug Reports verwalten

#### 📊 Statistiken
- `viewGlobalStats` - Globale Statistiken anzeigen
- `viewServerList` - Server-Liste anzeigen

## 📋 Verwendung

### Admin-User hinzufügen

1. Als Haupt-Admin im Admin-Panel einloggen
2. Sektion "Admin-User Verwaltung" öffnen
3. User-ID eingeben (optional: Username)
4. Auf "Hinzufügen" klicken
5. User erhält Basis-Berechtigungen:
   - `viewAdminPanel` (immer aktiv)
   - `viewBotStatus`
   - `viewGlobalStats`
   - `viewServerList`

### Berechtigungen verwalten

1. Bei einem Admin-User auf "Berechtigungen" klicken
2. Gewünschte Berechtigungen aktivieren/deaktivieren
3. Auf "Speichern" klicken
4. Änderungen sind sofort aktiv

### Admin-User entfernen

1. Bei einem Admin-User auf "Entfernen" klicken
2. Bestätigung abwarten
3. User verliert sofort alle Admin-Rechte

### Wartungsmodus aktivieren

1. Als Admin mit `toggleMaintenance` Berechtigung einloggen
2. Wartungsmodus-Toggle aktivieren
3. Optional: Wartungs-Nachricht eingeben
4. Auf "Wartungsmodus aktivieren" klicken
5. **Alle aktiven Dashboard-User werden sofort benachrichtigt**
6. Seiten laden sich automatisch neu
7. User ohne Bypass sehen die Wartungsseite

## 🔄 Live-Update-Flow

```
Admin aktiviert Wartungsmodus
         ↓
Bot API speichert Settings
         ↓
Interface erhält Response
         ↓
global.notifyMaintenanceMode(true)
         ↓
Socket.IO Broadcast an alle Clients
         ↓
Clients zeigen Notification
         ↓
Seite lädt nach 2 Sekunden neu
         ↓
Wartungsprüfung im maintenanceCheck
         ↓
User ohne Bypass → Wartungsseite
User mit Bypass → Normaler Zugriff
```

## 📁 Geänderte/Neue Dateien

### Neue Dateien
- `/bot/models/AdminUser.js` - AdminUser-Model
- `/data/adminusers.json` - AdminUser-Datenbank

### Geänderte Dateien
- `/interface/server.js` - Socket.IO Integration
- `/interface/routes/admin.js` - Admin-Rechteverwaltung & requirePermission Middleware
- `/interface/views/admin.ejs` - Admin-UI mit User-Verwaltung & Socket.IO
- `/interface/views/dashboard.ejs` - Socket.IO Client & Admin-Link
- `/interface/views/maintenance.ejs` - Socket.IO Client für Live-Updates
- `/package.json` - socket.io Dependency

## 🚀 API-Endpunkte

### Admin-User-Verwaltung (nur Haupt-Admin)

```
POST /admin/admin-users/add
Body: { userId, username, permissions }

PATCH /admin/admin-users/:userId/permissions
Body: { permissions }

DELETE /admin/admin-users/:userId

GET /admin/admin-users
```

### Wartungsmodus mit Live-Updates

```
POST /admin/toggle-maintenance
Body: { enabled, message }
→ Broadcastet automatisch an alle Clients
```

## 🔒 Sicherheit

- Nur Haupt-Admin kann Admin-User verwalten
- Admin-User können sich nicht selbst entfernen
- Haupt-Admin kann nicht entfernt werden
- Berechtigungen werden bei jedem Request geprüft
- `viewAdminPanel` muss immer aktiv sein
- Socket.IO-Events nur für authentifizierte User

## 💡 Best Practices

1. **Admin-User sparsam vergeben**
   - Nur vertrauenswürdige User
   - Nur notwendige Berechtigungen

2. **Wartungsmodus-Nachricht**
   - Klar formulieren
   - Geschätzte Dauer angeben
   - Grund für Wartung nennen

3. **Berechtigungen regelmäßig prüfen**
   - Nicht mehr aktive Admins entfernen
   - Berechtigungen anpassen

4. **Bypass-User**
   - Nur für wichtige Personen
   - In Kombination mit Admin-Rechten nutzen

## 🧪 Testing

### Wartungsmodus Live-Update testen

1. Öffne Dashboard in 2 Browser-Tabs
2. Logge in als Admin im Tab 1
3. Logge in als normaler User im Tab 2
4. Aktiviere Wartungsmodus in Tab 1
5. ✅ Tab 2 sollte Notification zeigen und neu laden

### Admin-Berechtigungen testen

1. Erstelle Admin-User mit eingeschränkten Rechten
2. Logge als dieser User ein
3. ✅ Nur zugewiesene Bereiche sollten sichtbar sein
4. Versuche API-Endpunkt ohne Berechtigung
5. ✅ 403 Forbidden sollte zurückkommen

## 📊 Monitoring

### Socket.IO Verbindungen
```javascript
// Server-Logs
📡 Client connected: [socket-id]
📡 Client disconnected: [socket-id]
🔔 Broadcasting maintenance mode change: true/false
```

### Admin-Aktivitäten
```javascript
// Admin-Logs
✅ Admin-User hinzugefügt: [userId]
🔄 Berechtigungen aktualisiert: [userId]
❌ Admin-User entfernt: [userId]
```

## 🐛 Troubleshooting

### Socket.IO verbindet nicht
- Prüfe Browser-Console auf Fehler
- Stelle sicher, dass Port 4302 erreichbar ist
- Prüfe Firewall-Regeln

### Admin-Panel nicht sichtbar
- Prüfe ob User in AdminUser-Liste ist
- Prüfe `viewAdminPanel` Berechtigung
- Console-Log in Dashboard-View prüfen

### Wartungsmodus wird nicht live übertragen
- Prüfe Server-Logs auf Broadcast-Event
- Prüfe Client-Console auf Socket-Events
- Stelle sicher `global.notifyMaintenanceMode` wird aufgerufen

## 🔮 Zukünftige Erweiterungen

- [ ] Admin-Aktivitäts-Log
- [ ] Email-Benachrichtigungen bei Wartungsmodus
- [ ] Zeitgesteuerte Wartungsarbeiten
- [ ] Rollen-System (Admin-Gruppen)
- [ ] 2FA für Admin-Login
- [ ] Admin-Audit-Trail
- [ ] Berechtigungs-Templates

## 📝 Changelog

### Version 2.0.0 - 2025-01-13

**Neue Features:**
- ✅ Socket.IO Live-Updates für Wartungsmodus
- ✅ Admin-User-Verwaltung mit granularen Berechtigungen
- ✅ Berechtigungs-basierte UI (Sections werden ein-/ausgeblendet)
- ✅ Automatisches Neuladen bei Wartungsmodus-Änderung
- ✅ Admin-Button im Dashboard für berechtigte User
- ✅ Permissions-Editor mit Modal-Dialog

**Verbesserungen:**
- ✅ Bessere UX bei Wartungsmodus-Aktivierung
- ✅ Klare Berechtigungs-Übersicht im Admin-Panel
- ✅ Live-Feedback für User ohne Bypass
- ✅ Middleware-basierte Berechtigungsprüfung

**Fixes:**
- ✅ User ohne Bypass konnten Dashboard weiter nutzen
- ✅ Keine Live-Benachrichtigung bei Wartungsmodus
- ✅ Nur ein Admin möglich
