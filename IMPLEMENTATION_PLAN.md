# TTH-Bot - Feature-Implementierungs-Plan

## ✅ Bereits implementiert (aktuell):

### Basis-Features:
- Ticket-System mit Claim, Close, Assign
- Team-Management (Rollen, Ränge)
- Moderation (Ban, Kick, Clear)
- Level-System mit XP
- Willkommenssystem
- Scheduled Messages
- Auto-Rollen
- Custom Commands
- Quick Announcements
- Backup & Export
- Admin-Panel (nur für thunderflash.0.0.7)

### Neu hinzugefügt (gerade):
- **Warn-System** (`/warn`, `/warns`, `/unwarn`)
  - Auto-Ban bei 5 Warnungen
  - DM-Benachrichtigung
  - Warn-History
  - Dashboard-Integration (in Arbeit)

---

## 🚀 Features aus deiner Liste - Implementierungsstatus:

### 1. Support und Ticketsystem
| Feature | Status | Notizen |
|---------|--------|---------|
| Ticketsystem | ✅ Fertig | Vollständig implementiert |
| `/priority` in Tickets | ⏳ TODO | Buttons für 🟢🟠🔴 |
| `/claim` in Tickets | ✅ Fertig | Button-System vorhanden |
| `/forward {fachbereich}` | ⏳ TODO | Ticket zu anderem Team weiterleiten |
| Ticket-Log | ✅ Teilweise | Log-Channel vorhanden, Web-Interface fehlt |

### 2. Moderation und User-Verwaltung
| Feature | Status | Notizen |
|---------|--------|---------|
| Warn-System | ✅ Fertig | Commands + Auto-Ban |
| Warn-Dashboard | ⏳ TODO | Übersicht im Web-Interface |
| Report-System | ⏳ TODO | `/report message` + `/report user` |
| Auto-Nickname-Prefixes | ⏳ TODO | [Partner], [Support] etc. |
| Verifizierungs-System | ⏳ TODO | Passcode-System |

### 3. Server-Verwaltung
| Feature | Status | Notizen |
|---------|--------|---------|
| Server-Statistiken | ✅ Teilweise | Dashboard Overview vorhanden |
| Server-Management | ✅ Fertig | Dashboard vollständig |
| Rollenverwaltung | ✅ Teilweise | Auto-Rollen vorhanden |
| Rolle bei Status | ⏳ TODO | Automatisch bei Custom Status |
| Auto IP-Embeds | ⏳ TODO | IPs automatisch als Embed |
| `/port` Commands | ⏳ TODO | Port-Management |
| `/projekt` Commands | ⏳ TODO | Auto-Setup von Projekten |

### 4. Team und Organisation
| Feature | Status | Notizen |
|---------|--------|---------|
| Bewerbungssystem | ✅ Fertig | Modal-Forms implementiert |
| Bewerbungs-Ausschreibungen | ⏳ TODO | Öffentlich posten |
| Team-Verwaltung | ✅ Fertig | Dashboard vorhanden |
| Öffentliche Team-Liste | ⏳ TODO | Embed mit allen Team-Mitgliedern |
| Abwesenheiten | ⏳ TODO | Dashboard-Feature |
| Team-Kalender | ⏳ TODO | Event-Verwaltung |

### 5. Kommunikation
| Feature | Status | Notizen |
|---------|--------|---------|
| `/news` Command | ⏳ TODO | News-Embeds erstellen |
| Twitch-Notifications | ⏳ TODO | Stream-Benachrichtigungen |
| Vorschläge | ⏳ TODO | Thread-System |
| Kummerkasten | ⏳ TODO | Anonymer Chat |
| Custom Embeds | ⏳ TODO | Embed-Builder im Dashboard |
| Auto-Werbung | ⏳ TODO | Zeitgesteuert |
| Rollen-Auswahl | ⏳ TODO | Reaction/Button-System |

### 6. Modpacks
| Feature | Status | Notizen |
|---------|--------|---------|
| `/modpack create` | ⏳ TODO | Modrinth/Curseforge API |
| `/modpack delete` | ⏳ TODO | Notifications entfernen |

---

## 📋 Nächste Schritte (Priorität):

### Phase 1 - Kritische Features (Sofort):
1. ✅ Warn-System Commands (FERTIG)
2. ⏳ Warn-Dashboard Integration
3. ⏳ Ticket Priority-System
4. ⏳ Report-System

### Phase 2 - Wichtige Features (Diese Woche):
5. ⏳ Custom Embed Builder (Dashboard)
6. ⏳ `/news` Command
7. ⏳ Projekt-Management (`/projekt`)
8. ⏳ Port-Management (`/port`)

### Phase 3 - Erweiterte Features (Nächste Woche):
9. ⏳ Twitch-Notifications
10. ⏳ Vorschläge-System
11. ⏳ Öffentliche Team-Liste
12. ⏳ Verifizierungs-System

### Phase 4 - Spezial-Features (Später):
13. ⏳ Modpack-Notifications
14. ⏳ Team-Kalender
15. ⏳ Kummerkasten
16. ⏳ Auto-Nickname-Prefixes

---

## 💡 Hinweis:
Die Liste ist sehr umfangreich! Ich schlage vor, Features schrittweise zu implementieren.
Sag mir, welche Features für dich die höchste Priorität haben, dann konzentriere ich mich darauf!

**Aktueller Fokus:** Warn-System ist fertig, Dashboard-Integration folgt als nächstes.
