// Test alle Commands auf Syntax-Fehler
const fs = require('fs');
const path = require('path');

const commandFolders = fs.readdirSync('./bot/commands');

let errors = [];
let success = 0;

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./bot/commands/${folder}`).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        try {
            const filePath = `./bot/commands/${folder}/${file}`;
            const command = require(filePath);
            
            // Prüfe ob data und execute vorhanden sind
            if (!command.data) {
                errors.push(`❌ ${folder}/${file}: Fehlt 'data' property`);
                continue;
            }
            if (!command.execute) {
                errors.push(`❌ ${folder}/${file}: Fehlt 'execute' function`);
                continue;
            }
            
            success++;
            console.log(`✅ ${folder}/${file}`);
        } catch (error) {
            errors.push(`❌ ${folder}/${file}: ${error.message}`);
        }
    }
}

console.log(`\n========================================`);
console.log(`✅ Erfolgreiche Commands: ${success}`);
console.log(`❌ Fehlerhafte Commands: ${errors.length}`);

if (errors.length > 0) {
    console.log(`\n❌ Fehler:`);
    errors.forEach(err => console.log(err));
    process.exit(1);
} else {
    console.log(`\n🎉 Alle Commands sind valide!`);
}
