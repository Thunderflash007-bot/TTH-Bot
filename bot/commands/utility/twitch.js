const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const TwitchNotification = require('../../models/TwitchNotification');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('twitch')
        .setDescription('Twitch-Stream Benachrichtigungen')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Fügt eine Twitch-Benachrichtigung hinzu')
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('Twitch-Username')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Discord-Channel für Benachrichtigungen')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('nachricht')
                        .setDescription('Custom Nachricht (verwende {user} für Username)')
                        .setRequired(false))
                .addRoleOption(option =>
                    option.setName('mention')
                        .setDescription('Rolle die gepingt werden soll')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Entfernt eine Twitch-Benachrichtigung')
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('Twitch-Username')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Zeigt alle Twitch-Benachrichtigungen')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'add') {
            const username = interaction.options.getString('username');
            const channel = interaction.options.getChannel('channel');
            const message = interaction.options.getString('nachricht');
            const mention = interaction.options.getRole('mention');
            
            // Prüfe ob bereits existiert
            const existing = TwitchNotification.findOne({ 
                guildId: interaction.guild.id, 
                twitchUsername: username 
            });
            
            if (existing) {
                return await interaction.reply({ 
                    content: `❌ Benachrichtigung für **${username}** existiert bereits!`, 
                    ephemeral: true 
                });
            }
            
            TwitchNotification.create({
                guildId: interaction.guild.id,
                channelId: channel.id,
                twitchUsername: username,
                message: message,
                mention: mention?.id
            });
            
            const embed = new EmbedBuilder()
                .setColor('#9146FF')
                .setTitle('✅ Twitch-Benachrichtigung hinzugefügt')
                .setDescription(`Stream-Benachrichtigungen für **${username}** wurden eingerichtet!`)
                .addFields(
                    { name: '📺 Twitch-Channel', value: username, inline: true },
                    { name: '📢 Discord-Channel', value: channel.toString(), inline: true }
                )
                .setFooter({ text: 'Hinweis: Twitch-API-Token muss in .env konfiguriert sein' });
            
            await interaction.reply({ embeds: [embed] });
            
        } else if (subcommand === 'remove') {
            const username = interaction.options.getString('username');
            
            const notification = TwitchNotification.findOne({ 
                guildId: interaction.guild.id, 
                twitchUsername: username 
            });
            
            if (!notification) {
                return await interaction.reply({ 
                    content: `❌ Keine Benachrichtigung für **${username}** gefunden!`, 
                    ephemeral: true 
                });
            }
            
            TwitchNotification.remove(notification.id);
            
            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`✅ Benachrichtigung für **${username}** wurde entfernt!`);
            
            await interaction.reply({ embeds: [embed] });
            
        } else if (subcommand === 'list') {
            const notifications = TwitchNotification.find({ guildId: interaction.guild.id });
            
            if (notifications.length === 0) {
                return await interaction.reply({ 
                    content: '❌ Keine Twitch-Benachrichtigungen konfiguriert!', 
                    ephemeral: true 
                });
            }
            
            const embed = new EmbedBuilder()
                .setColor('#9146FF')
                .setTitle('📺 Twitch-Benachrichtigungen')
                .setDescription(`${notifications.length} Benachrichtigung(en) aktiv`);
            
            for (const notif of notifications) {
                const channel = await interaction.guild.channels.fetch(notif.channelId).catch(() => null);
                embed.addFields({
                    name: `🎮 ${notif.twitchUsername}`,
                    value: `**Channel:** ${channel ? channel.toString() : 'Gelöscht'}\n**Status:** ${notif.enabled ? '✅ Aktiv' : '❌ Deaktiviert'}`,
                    inline: true
                });
            }
            
            await interaction.reply({ embeds: [embed] });
        }
    }
};
