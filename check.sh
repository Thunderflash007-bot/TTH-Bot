#!/bin/bash

echo "🔍 TTH-Bot Diagnose"
echo "==================="
echo ""

# Prüfe PM2 Status
echo "📊 PM2 Status:"
pm2 status
echo ""

# Prüfe ob Prozesse laufen
echo "🔍 Prozess-Check:"
BOT_PID=$(pm2 jlist | jq -r '.[] | select(.name=="tth-bot") | .pid')
INTERFACE_PID=$(pm2 jlist | jq -r '.[] | select(.name=="tth-interface") | .pid')

if [ "$BOT_PID" != "0" ] && [ "$BOT_PID" != "null" ]; then
    echo "✅ Bot läuft (PID: $BOT_PID)"
else
    echo "❌ Bot läuft NICHT"
fi

if [ "$INTERFACE_PID" != "0" ] && [ "$INTERFACE_PID" != "null" ]; then
    echo "✅ Interface läuft (PID: $INTERFACE_PID)"
else
    echo "❌ Interface läuft NICHT"
fi

echo ""
echo "📝 Letzte Bot-Logs:"
pm2 logs tth-bot --lines 20 --nostream 2>/dev/null || echo "Keine Logs verfügbar"

echo ""
echo "📝 Letzte Interface-Logs:"
pm2 logs tth-interface --lines 20 --nostream 2>/dev/null || echo "Keine Logs verfügbar"

echo ""
echo "🔧 Log-Dateien:"
if [ -f logs/bot-error.log ]; then
    echo "📄 Bot Errors (letzte 10 Zeilen):"
    tail -n 10 logs/bot-error.log
fi

if [ -f logs/interface-error.log ]; then
    echo "📄 Interface Errors (letzte 10 Zeilen):"
    tail -n 10 logs/interface-error.log
fi

echo ""
echo "🌐 Port-Check:"
if command -v netstat &> /dev/null; then
    echo "Ports in Verwendung:"
    netstat -tlnp 2>/dev/null | grep -E ':(3000|5000)' || echo "Keine Ports 3000/5000 in Verwendung"
fi

echo ""
echo "💡 Befehle:"
echo "  npm run pm2:restart  - Prozesse neu starten"
echo "  npm run pm2:logs     - Logs anzeigen"
echo "  npm run pm2:stop     - Prozesse stoppen"
echo "  ./start.sh           - Komplett neu starten"
