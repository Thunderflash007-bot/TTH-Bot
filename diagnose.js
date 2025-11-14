// Diagnose Script
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 TTH-Bot Diagnose');
console.log('===================\n');

// Prüfe .env
if (!fs.existsSync('.env')) {
    console.log('❌ .env Datei fehlt!');
} else {
    console.log('✅ .env Datei vorhanden');
}

// Prüfe config.json
const botConfigPath = path.join(__dirname, 'bot', 'config.json');
if (!fs.existsSync(botConfigPath)) {
    console.log('❌ bot/config.json fehlt!');
} else {
    console.log('✅ bot/config.json vorhanden');
    try {
        const config = JSON.parse(fs.readFileSync(botConfigPath, 'utf8'));
        if (!config.token || config.token === 'DEIN_BOT_TOKEN') {
            console.log('   ⚠️  Bot Token nicht konfiguriert!');
        }
        if (!config.clientId || config.clientId === 'DEINE_CLIENT_ID') {
            console.log('   ⚠️  Client ID nicht konfiguriert!');
        }
    } catch (error) {
        console.log('   ❌ Fehler beim Lesen der config.json:', error.message);
    }
}

// Prüfe node_modules
if (!fs.existsSync('node_modules')) {
    console.log('❌ node_modules fehlt! Führe "npm install" aus');
} else {
    console.log('✅ node_modules vorhanden');
}

// Prüfe Log-Verzeichnis
if (!fs.existsSync('logs')) {
    console.log('⚠️  logs Verzeichnis fehlt - wird beim Start erstellt');
    fs.mkdirSync('logs');
} else {
    console.log('✅ logs Verzeichnis vorhanden');
}

console.log('\n📊 PM2 Status:');
exec('pm2 jlist', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ PM2 nicht verfügbar oder keine Prozesse laufen');
        console.log('💡 Verwende: node simple-start.js (für direkten Start ohne PM2)');
        return;
    }
    
    try {
        const processes = JSON.parse(stdout);
        
        const botProcess = processes.find(p => p.name === 'tth-bot');
        const interfaceProcess = processes.find(p => p.name === 'tth-interface');
        
        if (botProcess) {
            console.log(`✅ Bot: ${botProcess.pm2_env.status} (PID: ${botProcess.pid}, Memory: ${Math.round(botProcess.monit.memory / 1024 / 1024)}MB)`);
        } else {
            console.log('❌ Bot läuft nicht');
        }
        
        if (interfaceProcess) {
            console.log(`✅ Interface: ${interfaceProcess.pm2_env.status} (PID: ${interfaceProcess.pid}, Memory: ${Math.round(interfaceProcess.monit.memory / 1024 / 1024)}MB)`);
        } else {
            console.log('❌ Interface läuft nicht');
        }
        
        // Prüfe auf Fehler
        if (botProcess && botProcess.pm2_env.status !== 'online') {
            console.log('\n⚠️  Bot Status:', botProcess.pm2_env.status);
        }
        if (interfaceProcess && interfaceProcess.pm2_env.status !== 'online') {
            console.log('⚠️  Interface Status:', interfaceProcess.pm2_env.status);
        }
        
    } catch (parseError) {
        console.log('❌ Fehler beim Parsen der PM2 Daten');
    }
});

// Prüfe Ports
setTimeout(() => {
    console.log('\n🌐 Port-Check:');
    
    const net = require('net');
    
    // Prüfe Bot API Port (5000)
    const botApiCheck = new net.Socket();
    botApiCheck.setTimeout(1000);
    botApiCheck.on('connect', () => {
        console.log('✅ Bot API (Port 5000) läuft');
        botApiCheck.destroy();
    });
    botApiCheck.on('timeout', () => {
        console.log('❌ Bot API (Port 5000) nicht erreichbar');
        botApiCheck.destroy();
    });
    botApiCheck.on('error', () => {
        console.log('❌ Bot API (Port 5000) nicht erreichbar');
    });
    botApiCheck.connect(5000, '127.0.0.1');
    
    // Prüfe Interface Port (3000)
    setTimeout(() => {
        const interfaceCheck = new net.Socket();
        interfaceCheck.setTimeout(1000);
        interfaceCheck.on('connect', () => {
            console.log('✅ Interface (Port 3000) läuft');
            interfaceCheck.destroy();
        });
        interfaceCheck.on('timeout', () => {
            console.log('❌ Interface (Port 3000) nicht erreichbar');
            interfaceCheck.destroy();
        });
        interfaceCheck.on('error', () => {
            console.log('❌ Interface (Port 3000) nicht erreichbar');
        });
        interfaceCheck.connect(3000, '127.0.0.1');
        
        setTimeout(() => {
            console.log('\n💡 Nächste Schritte:');
            console.log('  1. Falls PM2 nicht richtig läuft: node simple-start.js');
            console.log('  2. Logs prüfen: pm2 logs (oder logs/*.log Dateien)');
            console.log('  3. Prozesse neu starten: pm2 restart all');
            console.log('  4. Komplett neu: pm2 delete all && pm2 start ecosystem.config.js');
        }, 1500);
        
    }, 500);
}, 1000);
