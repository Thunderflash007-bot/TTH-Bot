const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('projekt')
        .setDescription('Projekt-Verwaltung')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Erstellt ein neues Projekt mit Channels, VC und Rolle')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name des Projekts')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('ip')
                        .setDescription('IP-Adresse des Projekts (optional)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Löscht ein Projekt vollständig')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name des Projekts')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('end')
                .setDescription('Beendet ein Projekt (archiviert)')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name des Projekts')
                        .setRequired(true))),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const projektName = interaction.options.getString('name');
        
        await interaction.deferReply();
        
        if (subcommand === 'create') {
            const ip = interaction.options.getString('ip');
            
            try {
                // 1. Erstelle Rolle
                const role = await interaction.guild.roles.create({
                    name: `${projektName}`,
                    color: '#5865F2',
                    reason: `Projekt ${projektName} erstellt`
                });
                
                // 2. Erstelle Kategorie
                const category = await interaction.guild.channels.create({
                    name: `📁 ${projektName}`,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: role.id,
                            allow: [PermissionsBitField.Flags.ViewChannel]
                        }
                    ]
                });
                
                // 3. Erstelle Text-Channel
                const textChannel = await interaction.guild.channels.create({
                    name: `💬-${projektName.toLowerCase()}`,
                    type: ChannelType.GuildText,
                    parent: category.id
                });
                
                // 4. Erstelle Voice-Channel
                const voiceChannel = await interaction.guild.channels.create({
                    name: `🔊 ${projektName}`,
                    type: ChannelType.GuildVoice,
                    parent: category.id
                });
                
                // 5. Erstelle IP-Embed
                const embed = new EmbedBuilder()
                    .setTitle(`📁 Projekt: ${projektName}`)
                    .setColor('#5865F2')
                    .setDescription(`Willkommen im **${projektName}** Projekt!`)
                    .addFields(
                        { name: '📝 Text-Channel', value: `${textChannel}`, inline: true },
                        { name: '🔊 Voice-Channel', value: `${voiceChannel}`, inline: true },
                        { name: '🎭 Rolle', value: `${role}`, inline: true }
                    )
                    .setTimestamp();
                
                if (ip) {
                    embed.addFields({ name: '🌐 IP-Adresse', value: `\`${ip}\``, inline: false });
                }
                
                await textChannel.send({ embeds: [embed] });
                
                const confirmEmbed = new EmbedBuilder()
                    .setColor('#57F287')
                    .setTitle('✅ Projekt erstellt!')
                    .setDescription(`Projekt **${projektName}** wurde erfolgreich eingerichtet!`)
                    .addFields(
                        { name: '📂 Kategorie', value: category.name, inline: true },
                        { name: '🎭 Rolle', value: role.name, inline: true },
                        { name: '📊 Channels', value: '2 erstellt', inline: true }
                    );
                
                await interaction.editReply({ embeds: [confirmEmbed] });
                
            } catch (error) {
                console.error('Fehler beim Erstellen des Projekts:', error);
                await interaction.editReply({ content: `❌ Fehler beim Erstellen: ${error.message}` });
            }
            
        } else if (subcommand === 'delete') {
            try {
                // Finde Kategorie
                const category = interaction.guild.channels.cache.find(
                    c => c.type === ChannelType.GuildCategory && c.name.includes(projektName)
                );
                
                if (!category) {
                    return await interaction.editReply({ content: `❌ Projekt \`${projektName}\` nicht gefunden!` });
                }
                
                // Lösche alle Channels in der Kategorie
                const channelsToDelete = interaction.guild.channels.cache.filter(c => c.parentId === category.id);
                for (const [, channel] of channelsToDelete) {
                    await channel.delete(`Projekt ${projektName} gelöscht`);
                }
                
                // Lösche Kategorie
                await category.delete(`Projekt ${projektName} gelöscht`);
                
                // Lösche Rolle
                const role = interaction.guild.roles.cache.find(r => r.name === projektName);
                if (role) await role.delete(`Projekt ${projektName} gelöscht`);
                
                const embed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription(`✅ Projekt **${projektName}** wurde vollständig gelöscht!`);
                
                await interaction.editReply({ embeds: [embed] });
                
            } catch (error) {
                console.error('Fehler beim Löschen des Projekts:', error);
                await interaction.editReply({ content: `❌ Fehler: ${error.message}` });
            }
            
        } else if (subcommand === 'end') {
            try {
                // Finde Kategorie und benenne um
                const category = interaction.guild.channels.cache.find(
                    c => c.type === ChannelType.GuildCategory && c.name.includes(projektName)
                );
                
                if (!category) {
                    return await interaction.editReply({ content: `❌ Projekt \`${projektName}\` nicht gefunden!` });
                }
                
                await category.setName(`📦 [ARCHIV] ${projektName}`);
                
                // Sperre alle Channels
                const channels = interaction.guild.channels.cache.filter(c => c.parentId === category.id);
                for (const [, channel] of channels) {
                    await channel.permissionOverwrites.edit(interaction.guild.id, {
                        SendMessages: false,
                        Connect: false
                    });
                }
                
                const embed = new EmbedBuilder()
                    .setColor('#FEE75C')
                    .setDescription(`✅ Projekt **${projektName}** wurde archiviert!`);
                
                await interaction.editReply({ embeds: [embed] });
                
            } catch (error) {
                console.error('Fehler beim Archivieren:', error);
                await interaction.editReply({ content: `❌ Fehler: ${error.message}` });
            }
        }
    }
};
