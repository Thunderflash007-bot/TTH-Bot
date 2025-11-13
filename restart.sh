#!/bin/bash

# Finde den Bot-Prozess
BOT_PID=$(pgrep -f "node bot/index.js")

if [ -n "$BOT_PID" ]; then
    echo "🔄 Stopping bot (PID: $BOT_PID)..."
    kill $BOT_PID
    sleep 2
fi

echo "🚀 Starting bot..."
cd /workspaces/TTH-Bot
nohup npm start > logs/bot.log 2>&1 &

echo "✅ Bot restarted!"
