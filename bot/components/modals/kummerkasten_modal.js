const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const Kummerkasten = require('../../models/Kummerkasten');

module.exports = {
    customId: 'kummerkasten_modal',
    async execute(interaction) {
        const message = interaction.fields.getTextInputValue('kummerkasten_message');
        
        const config = GuildConfig.findOne({ guildId: interaction.guild.id });
        
        if (!config || !config.kummerkastenChannelId) {
            return await interaction.reply({
                content: '❌ Kummerkasten ist nicht eingerichtet!',
                ephemeral: true
            });
        }
        
        try {
            const channel = await interaction.guild.channels.fetch(config.kummerkastenChannelId);
            
            if (!channel) {
                return await interaction.reply({
                    content: '❌ Kummerkasten-Channel nicht gefunden!',
                    ephemeral: true
                });
            }
            
            // Anonyme ID generieren (nur letzte 4 Zeichen der User-ID)
            const anonymousId = `#${interaction.user.id.slice(-4)}`;
            
            // Embed erstellen
            const embed = new EmbedBuilder()
                .setColor('#FEE75C')
                .setTitle('📬 Neue Kummerkasten-Nachricht')
                .setDescription(message)
                .addFields(
                    { name: 'Anonyme ID', value: anonymousId, inline: true },
                    { name: 'Status', value: '🟢 Offen', inline: true }
                )
                .setTimestamp();
            
            // Thread erstellen
            const threadMessage = await channel.send({ embeds: [embed] });
            const thread = await threadMessage.startThread({
                name: `Kummerkasten ${anonymousId}`,
                autoArchiveDuration: 4320, // 3 Tage
                reason: 'Kummerkasten Anfrage'
            });
            
            // Supporter-Rolle erwähnen (falls konfiguriert)
            if (config.kummerkastenSupportRoleId) {
                const supporterRole = await interaction.guild.roles.fetch(config.kummerkastenSupportRoleId);
                if (supporterRole) {
                    await thread.send({
                        content: `${supporterRole} - Neue anonyme Anfrage eingegangen!`,
                        allowedMentions: { roles: [config.kummerkastenSupportRoleId] }
                    });
                }
            }
            
            // In Datenbank speichern
            Kummerkasten.create({
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                message: message,
                threadId: thread.id
            });
            
            const successEmbed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription('✅ Deine anonyme Nachricht wurde gesendet!\n\nDas Support-Team wird sich zeitnah darum kümmern.')
                .addFields({
                    name: 'Deine Anonyme ID',
                    value: anonymousId,
                    inline: true
                });
            
            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
            
        } catch (error) {
            console.error('Fehler beim Erstellen der Kummerkasten-Nachricht:', error);
            await interaction.reply({
                content: '❌ Es ist ein Fehler aufgetreten!',
                ephemeral: true
            });
        }
    }
};
