const { REST, Routes } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`✅ Bot ist online als ${client.user.tag}`);
        
        // Slash Commands registrieren
        const commands = [];
        client.commands.forEach(command => {
            commands.push(command.data.toJSON());
        });

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

        try {
            console.log('🔄 Registriere Slash Commands...');
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
            console.log('✅ Slash Commands registriert!');
        } catch (error) {
            console.error('❌ Fehler beim Registrieren:', error);
        }

        // Status setzen
        client.user.setActivity('Tickets & Bewerbungen', { type: 3 });
    }
};
