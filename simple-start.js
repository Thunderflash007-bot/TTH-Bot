// Simple Start Script ohne PM2
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 TTH-Bot Direktstart (ohne PM2)');
console.log('===================================\n');

// Starte Bot
const bot = spawn('node', [path.join(__dirname, 'bot', 'index.js')], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
});

bot.on('error', (error) => {
    console.error('❌ Bot Fehler:', error);
});

bot.on('exit', (code) => {
    console.log(`⚠️ Bot beendet mit Code ${code}`);
    process.exit(code);
});

// Starte Interface nach 2 Sekunden
setTimeout(() => {
    const interface = spawn('node', [path.join(__dirname, 'interface', 'server.js')], {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
    });

    interface.on('error', (error) => {
        console.error('❌ Interface Fehler:', error);
    });

    interface.on('exit', (code) => {
        console.log(`⚠️ Interface beendet mit Code ${code}`);
    });
}, 2000);

console.log('\n✅ Bot und Interface werden gestartet...');
console.log('💡 Drücke Ctrl+C um beide zu beenden\n');

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Beende Prozesse...');
    bot.kill();
    process.exit(0);
});
