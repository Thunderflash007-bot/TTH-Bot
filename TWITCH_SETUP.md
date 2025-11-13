# 🎮 Twitch Stream Benachrichtigungen - Setup Guide

## 📋 Übersicht

Das Twitch-Benachrichtigungs-System ermöglicht es Admins, **individuelle Twitch-Accounts** über das Dashboard hinzuzufügen. Jeder Admin kann seine eigenen Streamer konfigurieren mit:

- ✅ **Individueller Twitch-Username**
- ✅ **Eigener Benachrichtigungs-Channel**
- ✅ **Custom Nachricht** (optional)
- ✅ **Rollen-Erwähnung** (@everyone, @here, oder beliebige Rolle)
- ✅ **Aktivieren/Pausieren** per Klick
- ✅ **Live-Verwaltung** im Dashboard

## 🔧 Twitch API Setup (erforderlich)

### Schritt 1: Twitch Developer Console

1. Gehe zu: **https://dev.twitch.tv/console/apps**
2. Melde dich mit deinem Twitch-Account an
3. Klicke auf **"Register Your Application"**

### Schritt 2: App-Konfiguration

Fülle das Formular aus:
- **Name**: `TTH Bot Notifications` (oder beliebig)
- **OAuth Redirect URLs**: `http://localhost` (wird nicht benötigt, aber Pflichtfeld)
- **Category**: `Application Integration`
- **Client Type**: `Confidential`

### Schritt 3: Credentials kopieren

Nach der Erstellung:
1. Kopiere die **Client-ID**
2. Klicke auf **"New Secret"** und kopiere das **Client Secret** (wird nur einmal angezeigt!)

### Schritt 4: .env konfigurieren

Öffne `/workspaces/TTH-Bot/.env` und füge ein:

```env
TWITCH_CLIENT_ID=deine_client_id_hier
TWITCH_CLIENT_SECRET=dein_client_secret_hier
```

## 📱 Dashboard Nutzung

### Twitch-Account hinzufügen

1. Gehe zum **Dashboard** → Tab **"Tools"**
2. Scrolle zu **"Twitch Stream Benachrichtigungen"**
3. Fülle das Formular aus:
   - **Twitch Username**: z.B. `shroud` (ohne @)
   - **Channel**: Wähle den Discord-Channel für Benachrichtigungen
   - **Nachricht** (optional): z.B. `🔴 Stream ist live!`
   - **Erwähnung** (optional): @everyone, @here oder eine Rolle
4. Klick auf **"Twitch-Account hinzufügen"**

### Verwaltung

In der Liste siehst du alle konfigurierten Accounts:

- **⏸️/▶️ Button**: Account pausieren/aktivieren
- **🗑️ Button**: Account löschen
- **Status-Anzeige**: 🟢 Aktiv / ⏸️ Pausiert

## 🔄 Automatische Prüfung

Der Bot prüft **alle 2 Minuten** automatisch, ob Streamer live sind:

- ✅ Neue Streams werden sofort erkannt
- ✅ Keine Duplikate (via `lastStreamId`)
- ✅ Rich Embeds mit:
  - Stream-Titel
  - Spiel/Kategorie
  - Zuschauer-Anzahl
  - Live-Thumbnail (1280x720)
  - Direkter Twitch-Link

## 🎨 Beispiel-Benachrichtigung

```
@everyone 🔴 Stream ist live!

┌─────────────────────────────────┐
│ 🔴 shroud ist jetzt LIVE!       │
├─────────────────────────────────┤
│ CS2 Ranked - Let's go!          │
│                                 │
│ 🎮 Spiel: Counter-Strike 2      │
│ 👥 Zuschauer: 15,234            │
│                                 │
│ [Stream-Thumbnail]              │
│                                 │
│ 🔗 twitch.tv/shroud             │
└─────────────────────────────────┘
```

## ⚠️ Wichtige Hinweise

- **API Limits**: Twitch API hat großzügige Rate-Limits (keine Probleme bei normaler Nutzung)
- **Token**: Access Token wird automatisch erneuert
- **Fehler**: Bei fehlenden Credentials wird eine Warnung im Log angezeigt
- **Offline-Streams**: Werden nicht erneut benachrichtigt (tracked via `lastStreamId`)

## 🧪 Testing

1. Bot neustarten nach .env-Änderung
2. Twitch-Account im Dashboard hinzufügen
3. Warte bis Streamer live geht (oder teste mit einem Account der bereits live ist)
4. Benachrichtigung erscheint im konfigurierten Channel

## 📊 Dashboard-Features

- ✅ **Multi-Account**: Unbegrenzt viele Twitch-Accounts
- ✅ **Per-Channel**: Verschiedene Channels für verschiedene Streamer
- ✅ **Custom Messages**: Individuelle Nachrichten pro Streamer
- ✅ **Flexible Mentions**: @everyone, @here, oder spezifische Rollen
- ✅ **Toggle**: An/Aus ohne Löschen
- ✅ **Live-Updates**: Sofortige Aktualisierung der Liste

## 🚀 Commands

Alternativ können Twitch-Accounts auch per Slash-Command verwaltet werden:

```
/twitch add username:shroud channel:#streams
/twitch remove username:shroud
/twitch list
```

## 🔒 Permissions

Nur Admins mit **Manage Server** Permission können:
- Twitch-Accounts hinzufügen/entfernen
- Benachrichtigungen pausieren/aktivieren
- Dashboard-Settings ändern

---

**Status**: ✅ Vollständig implementiert und einsatzbereit!
