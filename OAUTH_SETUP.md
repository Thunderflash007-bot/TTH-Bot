# Discord OAuth Setup - Fehlerbehebung

## ❌ Problem: "Ungültiges OAuth2 redirect_uri"

### Ursache
Die Redirect-URI muss im Discord Developer Portal registriert werden!

### ✅ Lösung - Schritt für Schritt:

1. **Öffne das Discord Developer Portal**
   - Gehe zu: https://discord.com/developers/applications
   - Melde dich mit deinem Discord-Account an

2. **Wähle deine Application**
   - Klicke auf deine Bot-Application (TTH-Bot)

3. **Gehe zu OAuth2 → General**
   - Linkes Menü: Klicke auf "OAuth2"
   - Dann auf "General"

4. **Füge Redirects hinzu**
   - Scrolle nach unten zu "Redirects"
   - Klicke auf "Add Redirect"
   - Füge **exakt** diese URL ein:
   ```
   https://super-duper-palm-tree-5g57w7jqjvprfv5jj-8080.app.github.dev/auth/discord/callback
   ```
   
   **Für lokale Entwicklung** (optional):
   ```
   http://localhost:8080/auth/discord/callback
   ```
   
5. **Speichern!**
   - Klicke unten auf "Save Changes"
   - ⚠️ Wichtig: Ohne Speichern funktioniert es nicht!

### 📝 Für Production (später):
Wenn du den Bot auf einem Server hostest, füge auch diese URL hinzu:
```
https://deine-domain.de/auth/discord/callback
```

### ✅ Test nach dem Setup:
1. Starte das Web-Interface neu (falls noch nicht gestartet):
   ```bash
   node interface/server.js
   ```

2. Öffne im Browser: http://localhost:8080

3. Klicke auf "Login mit Discord"

4. Discord sollte jetzt die Berechtigung anfragen

5. Nach Zustimmung wirst du zum Dashboard weitergeleitet

### 🔍 Häufige Fehler:

❌ **Tippfehler in der URL**
- Stelle sicher: `http://` (nicht `https://` bei localhost)
- Port muss `8080` sein
- Pfad muss `/auth/discord/callback` sein

❌ **Änderungen nicht gespeichert**
- Klicke immer auf "Save Changes"!

❌ **Falscher Port**
- Prüfe in der `.env`: `WEB_PORT=8080`
- Interface muss auf dem gleichen Port laufen

### 📸 Screenshot-Anleitung:

Die korrekte Einstellung sollte so aussehen:

```
Redirects
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
https://super-duper-palm-tree-5g57w7jqjvprfv5jj-8080.app.github.dev/auth/discord/callback    [×]
                                                                                         [Add Redirect]

                                                                                   [Save Changes]
```

### ⚠️ Wichtig für CLIENT_SECRET:
Falls du das CLIENT_SECRET noch nicht hast:
1. Im gleichen Menü (OAuth2 → General)
2. Scrolle nach oben zu "CLIENT SECRET"
3. Klicke "Reset Secret" (oder kopiere das bestehende)
4. Füge es in die `.env` ein

### 🚀 Nach erfolgreicher Konfiguration:
- ✅ Login funktioniert
- ✅ Discord fragt nach Berechtigungen
- ✅ Du wirst zum Dashboard weitergeleitet
- ✅ Deine Server werden angezeigt

---

### 🎯 Quick-Fix Checklist:

- [ ] Discord Developer Portal geöffnet
- [ ] Richtige Application ausgewählt
- [ ] OAuth2 → General aufgerufen
- [ ] Redirect URL hinzugefügt: `https://super-duper-palm-tree-5g57w7jqjvprfv5jj-8080.app.github.dev/auth/discord/callback`
- [ ] "Save Changes" geklickt
- [ ] Interface neu gestartet
- [ ] Browser-Test durchgeführt: https://super-duper-palm-tree-5g57w7jqjvprfv5jj-8080.app.github.dev/

Bei Fragen: Prüfe die Console-Ausgabe des Interfaces auf Fehlermeldungen!
