const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Zeigt alle verfügbaren Commands')
        .addStringOption(option =>
            option.setName('kategorie')
                .setDescription('Wähle eine Kategorie')
                .setRequired(false)
                .addChoices(
                    { name: '🛡️ Moderation', value: 'moderation' },
                    { name: '🎫 Tickets', value: 'tickets' },
                    { name: '⚙️ Konfiguration', value: 'config' },
                    { name: '👥 Team', value: 'team' },
                    { name: '📊 Utility', value: 'utility' },
                    { name: '🎮 Level-System', value: 'level' }
                )),
    
    async execute(interaction) {
        const category = interaction.options.getString('kategorie');

        if (!category) {
            // Übersichts-Embed
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setAuthor({ 
                    name: `${interaction.client.user.username} - Hilfe`,
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setDescription('Willkommen beim TTH-Bot! Wähle eine Kategorie um mehr über die Commands zu erfahren.\n\n' +
                    'Nutze `/help <kategorie>` um Details zu einer Kategorie zu sehen.')
                .addFields(
                    { 
                        name: '🛡️ Moderation', 
                        value: 'Verwaltung und Moderation des Servers\n`/help kategorie:moderation`', 
                        inline: true 
                    },
                    { 
                        name: '🎫 Tickets', 
                        value: 'Ticket-System Verwaltung\n`/help kategorie:tickets`', 
                        inline: true 
                    },
                    { 
                        name: '⚙️ Konfiguration', 
                        value: 'Server-Einstellungen\n`/help kategorie:config`', 
                        inline: true 
                    },
                    { 
                        name: '👥 Team', 
                        value: 'Team-Rollen Verwaltung\n`/help kategorie:team`', 
                        inline: true 
                    },
                    { 
                        name: '📊 Utility', 
                        value: 'Nützliche Informationen\n`/help kategorie:utility`', 
                        inline: true 
                    },
                    { 
                        name: '🎮 Level-System', 
                        value: 'XP und Level Features\n`/help kategorie:level`', 
                        inline: true 
                    }
                )
                .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
                .setFooter({ 
                    text: `Angefordert von ${interaction.user.tag}`, 
                    iconURL: interaction.user.displayAvatarURL() 
                })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        // Kategorie-spezifische Embeds
        const embeds = {
            moderation: new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle('🛡️ Moderation Commands')
                .setDescription('Befehle zur Verwaltung und Moderation deines Servers.')
                .addFields(
                    { 
                        name: '`/ban <user> [grund]`', 
                        value: '🔨 Bannt einen User vom Server\n**Berechtigung:** `BAN_MEMBERS`', 
                        inline: false 
                    },
                    { 
                        name: '`/kick <user> [grund]`', 
                        value: '👢 Kickt einen User vom Server\n**Berechtigung:** `KICK_MEMBERS`', 
                        inline: false 
                    },
                    { 
                        name: '`/clear <anzahl>`', 
                        value: '🧹 Löscht 1-100 Nachrichten\n**Berechtigung:** `MANAGE_MESSAGES`', 
                        inline: false 
                    }
                )
                .setThumbnail(interaction.guild.iconURL()),

            tickets: new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🎫 Ticket Commands')
                .setDescription('Verwaltung des Ticket-Systems.')
                .addFields(
                    { 
                        name: '`/setup-tickets [kategorie] [support-rolle]`', 
                        value: '🎟️ Erstellt das Ticket-Panel\n**Berechtigung:** `ADMINISTRATOR`\n\n' +
                            '**Parameter:**\n' +
                            '• `kategorie` - Kategorie für Tickets (optional)\n' +
                            '• `support-rolle` - Rolle die Tickets sehen kann (optional)', 
                        inline: false 
                    },
                    { 
                        name: '`/close [grund]`', 
                        value: '🔒 Schließt das aktuelle Ticket\n**Berechtigung:** Ticket-Ersteller oder Support\n\n' +
                            '**Parameter:**\n' +
                            '• `grund` - Grund für das Schließen (optional)', 
                        inline: false 
                    },
                    {
                        name: '🎫 Ticket-Features',
                        value: '• **Claim** - Ticket übernehmen\n' +
                            '• **Unclaim** - Ticket freigeben\n' +
                            '• **Assign** - Ticket zuweisen\n' +
                            '• **Close** - Ticket schließen',
                        inline: false
                    }
                )
                .setThumbnail(interaction.guild.iconURL()),

            config: new EmbedBuilder()
                .setColor('#FEE75C')
                .setTitle('⚙️ Konfigurations-Commands')
                .setDescription('Einstellungen für deinen Server.')
                .addFields(
                    { 
                        name: '`/config`', 
                        value: '⚙️ Zeigt die Server-Konfiguration\n**Berechtigung:** `ADMINISTRATOR`', 
                        inline: false 
                    },
                    { 
                        name: '`/welcome-setup`', 
                        value: '👋 Richtet das Willkommens-System ein\n**Berechtigung:** `ADMINISTRATOR`', 
                        inline: false 
                    }
                )
                .setThumbnail(interaction.guild.iconURL()),

            team: new EmbedBuilder()
                .setColor('#57F287')
                .setTitle('👥 Team-Management Commands')
                .setDescription('Verwaltung von Team-Rollen und Mitgliedern.')
                .addFields(
                    { 
                        name: '`/team add-role <rolle> <rang>`', 
                        value: '➕ Fügt eine Rolle zum Team hinzu\n**Berechtigung:** `ADMINISTRATOR`\n\n' +
                            '**Verfügbare Ränge:**\n' +
                            '• 👑 Owner\n• ⚡ Admin\n• 🛡️ Moderator\n• 💬 Supporter\n' +
                            '• 🎨 Developer\n• 📝 Content Creator\n• 🎯 Trial', 
                        inline: false 
                    },
                    { 
                        name: '`/team remove-role <rolle>`', 
                        value: '➖ Entfernt eine Rolle vom Team\n**Berechtigung:** `ADMINISTRATOR`', 
                        inline: false 
                    },
                    { 
                        name: '`/team roles`', 
                        value: '📋 Zeigt alle Team-Rollen an\n**Berechtigung:** Jeder', 
                        inline: false 
                    },
                    { 
                        name: '`/team list`', 
                        value: '👥 Zeigt alle Team-Mitglieder mit Rängen\n**Berechtigung:** Jeder', 
                        inline: false 
                    }
                )
                .setThumbnail(interaction.guild.iconURL()),

            utility: new EmbedBuilder()
                .setColor('#00D9FF')
                .setTitle('📊 Utility Commands')
                .setDescription('Nützliche Informations-Commands.')
                .addFields(
                    { 
                        name: '`/userinfo [user]`', 
                        value: '👤 Zeigt detaillierte User-Informationen\n**Berechtigung:** Jeder\n\n' +
                            '• Account-Alter, Rollen, Level, XP\n' +
                            '• Status, Badges, Banner', 
                        inline: false 
                    },
                    { 
                        name: '`/serverinfo`', 
                        value: '🏠 Zeigt Server-Statistiken\n**Berechtigung:** Jeder\n\n' +
                            '• Mitglieder, Channels, Rollen\n' +
                            '• Boosts, Emojis, Verifizierung', 
                        inline: false 
                    },
                    { 
                        name: '`/help [kategorie]`', 
                        value: '❓ Zeigt diese Hilfe-Seite\n**Berechtigung:** Jeder', 
                        inline: false 
                    }
                )
                .setThumbnail(interaction.guild.iconURL()),

            level: new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle('🎮 Level-System')
                .setDescription('XP und Level Features.')
                .addFields(
                    { 
                        name: '`/level [user]`', 
                        value: '⭐ Zeigt Level und XP eines Users\n**Berechtigung:** Jeder\n\n' +
                            '• Aktuelles Level und XP\n' +
                            '• Fortschrittsbalken\n' +
                            '• Server-Rang\n' +
                            '• Level-Titel', 
                        inline: false 
                    },
                    {
                        name: '💎 XP System',
                        value: '• Erhalte 15-25 XP pro Nachricht\n' +
                            '• Cooldown: 60 Sekunden\n' +
                            '• Automatische Level-Up Nachrichten',
                        inline: false
                    }
                )
                .setThumbnail(interaction.guild.iconURL())
        };

        const embed = embeds[category];
        embed.setFooter({ 
            text: `Angefordert von ${interaction.user.tag}`, 
            iconURL: interaction.user.displayAvatarURL() 
        })
        .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
