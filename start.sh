#!/bin/bash

echo "🚀 TTH-Bot Startup Script"
echo "=========================="
echo ""

# Prüfe ob .env existiert
if [ ! -f .env ]; then
    echo "❌ Fehler: .env Datei nicht gefunden!"
    echo "📖 Bitte erstelle eine .env Datei mit deinen Discord Tokens"
    exit 1
fi

# Prüfe ob node_modules existiert
if [ ! -d node_modules ]; then
    echo "📦 node_modules nicht gefunden - installiere Dependencies..."
    npm install
fi

# Erstelle logs Verzeichnis falls nicht vorhanden
mkdir -p logs

echo "🔍 Überprüfe aktuelle PM2 Prozesse..."
pm2 list

echo ""
echo "🛑 Stoppe alte Prozesse..."
pm2 stop all 2>/dev/null
pm2 delete all 2>/dev/null

echo ""
echo "🧹 Cleanup..."
pm2 flush

echo ""
echo "✅ Starte Bot und Interface..."
pm2 start ecosystem.config.js

echo ""
echo "📊 Status:"
pm2 status

echo ""
echo "📝 Zeige Logs (Ctrl+C zum Beenden):"
pm2 logs
