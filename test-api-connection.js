// Test Interface -> Bot API Kommunikation
const botClient = require('./interface/utils/botClient');

async function test() {
    console.log('🔍 Teste Bot API Verbindung...\n');
    
    // 1. Health Check
    console.log('1. Health Check:');
    try {
        const status = await botClient.checkBotStatus();
        console.log('   ✅ Bot Status:', status);
    } catch (error) {
        console.log('   ❌ Fehler:', error.message);
    }
    
    // 2. Guild Data Test (wenn Bot auf Servern ist)
    console.log('\n2. Guild Data Test:');
    try {
        // Hole alle Guilds
        const axios = require('axios');
        const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';
        const response = await axios.get(`${BOT_API_URL}/api/guilds`);
        const guilds = response.data;
        
        console.log(`   ✅ Bot ist auf ${guilds.length} Server(n)`);
        
        if (guilds.length > 0) {
            const guild = guilds[0];
            console.log(`\n   📋 Teste Server: ${guild.name} (${guild.id})`);
            
            const guildData = await botClient.getGuildData(guild.id);
            console.log(`   ✅ ${guildData.channels.length} Text-Channels`);
            console.log(`   ✅ ${guildData.categories.length} Kategorien`);
            console.log(`   ✅ ${guildData.roles.length} Rollen`);
            
            if (guildData.channels.length > 0) {
                console.log('\n   📝 Erste 3 Channels:');
                guildData.channels.slice(0, 3).forEach(c => {
                    console.log(`      - #${c.name}`);
                });
            }
            
            if (guildData.roles.length > 0) {
                console.log('\n   🎭 Erste 3 Rollen:');
                guildData.roles.slice(0, 3).forEach(r => {
                    console.log(`      - @${r.name} (${r.color})`);
                });
            }
        }
    } catch (error) {
        console.log('   ❌ Fehler:', error.message);
    }
    
    console.log('\n✅ Test abgeschlossen!');
}

test().catch(console.error);
