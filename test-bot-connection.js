// Test Bot-Client Verbindung
const botClient = require('./interface/utils/botClient');

async function test() {
    try {
        const client = botClient.getClient();
        
        if (!client) {
            console.log('❌ Bot-Client nicht verfügbar - Bot muss laufen!');
            return;
        }
        
        console.log('✅ Bot-Client verbunden');
        console.log(`📊 Bot ist auf ${client.guilds.cache.size} Servern`);
        
        // Zeige alle Server
        client.guilds.cache.forEach(guild => {
            console.log(`\n🏠 Server: ${guild.name} (ID: ${guild.id})`);
            console.log(`   👥 Mitglieder: ${guild.memberCount}`);
            console.log(`   📝 Channels: ${guild.channels.cache.size}`);
            console.log(`   🎭 Rollen: ${guild.roles.cache.size}`);
        });
        
        // Test getGuildData für ersten Server
        const firstGuild = client.guilds.cache.first();
        if (firstGuild) {
            console.log(`\n🔍 Test getGuildData für: ${firstGuild.name}`);
            const data = await botClient.getGuildData(firstGuild.id);
            console.log(`   ✅ ${data.channels.length} Text-Channels geladen`);
            console.log(`   ✅ ${data.categories.length} Kategorien geladen`);
            console.log(`   ✅ ${data.roles.length} Rollen geladen`);
            
            // Zeige erste 5 Rollen
            console.log('\n   🎭 Erste 5 Rollen:');
            data.roles.slice(0, 5).forEach(role => {
                console.log(`      - ${role.name} (${role.color})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Fehler:', error.message);
    }
}

// Warte 3 Sekunden, damit Bot bereit ist
setTimeout(test, 3000);
