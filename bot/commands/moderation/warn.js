const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Warning = require('../../models/Warning');
const ModerationLog = require('../../models/ModerationLog');
const GlobalSettings = require('../../models/GlobalSettings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warnt einen User')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Der zu warnende User')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('grund')
                .setDescription('Grund für die Warnung')
                .setRequired(true)),
    
    async execute(interaction) {
        // Feature Check
        if (!GlobalSettings.isFeatureEnabled('warns')) {
            const settings = GlobalSettings.getSettings();
            const reason = settings.features.warns?.reason || 'Dieses Feature ist vorübergehend deaktiviert.';
            
            const embed = new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle('❌ Feature deaktiviert')
                .setDescription(`Das Warn-System ist derzeit deaktiviert.\n\n**Grund:** ${reason}`)
                .setFooter({ text: 'Kontaktiere einen Administrator' });
            
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('grund');
        
        // Erstelle Warnung
        const warning = Warning.create({
            userId: target.id,
            guildId: interaction.guild.id,
            moderatorId: interaction.user.id,
            reason: reason
        });
        
        // Log erstellen
        ModerationLog.create({
            guildId: interaction.guild.id,
            userId: target.id,
            moderatorId: interaction.user.id,
            action: 'warn',
            reason: reason
        });
        
        // Zähle aktive Warnungen
        const userWarnings = Warning.getUserWarnings(target.id, interaction.guild.id);
        const warnCount = userWarnings.length;
        
        const embed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setAuthor({ 
                name: `Warnung ausgesprochen`,
                iconURL: interaction.guild.iconURL()
            })
            .setDescription(`⚠️ ${target} wurde verwarnt!`)
            .addFields(
                { name: '👤 User', value: `${target.tag} (${target.id})`, inline: true },
                { name: '🛡️ Moderator', value: interaction.user.tag, inline: true },
                { name: '📊 Warnungen gesamt', value: `${warnCount}`, inline: true },
                { name: '📝 Grund', value: reason, inline: false }
            )
            .setFooter({ text: `Warn-ID: ${warning.id}` })
            .setTimestamp();
        
        // DM an User senden
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('#FEE75C')
                .setTitle(`⚠️ Warnung auf ${interaction.guild.name}`)
                .setDescription(`Du wurdest verwarnt!`)
                .addFields(
                    { name: '📝 Grund', value: reason },
                    { name: '📊 Deine Warnungen', value: `${warnCount} aktive Warnung(en)` }
                )
                .setFooter({ text: 'Bitte beachte die Serverregeln' })
                .setTimestamp();
            
            await target.send({ embeds: [dmEmbed] });
        } catch (error) {
            embed.setFooter({ text: `Warn-ID: ${warning.id} | DM konnte nicht gesendet werden` });
        }
        
        await interaction.reply({ embeds: [embed] });
        
        // Auto-Actions bei mehreren Warnungen
        if (warnCount >= 5) {
            try {
                const member = await interaction.guild.members.fetch(target.id);
                await member.ban({ reason: `Automatisch gebannt nach ${warnCount} Warnungen` });
                
                const banEmbed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription(`🔨 ${target} wurde automatisch nach ${warnCount} Warnungen gebannt!`);
                
                await interaction.followUp({ embeds: [banEmbed] });
            } catch (error) {
                console.error('Fehler beim Auto-Ban:', error);
            }
        } else if (warnCount >= 3) {
            await interaction.followUp({ 
                content: `⚠️ **Hinweis:** ${target} hat bereits ${warnCount} Warnungen! Bei 5 Warnungen erfolgt ein automatischer Ban.`,
                ephemeral: true 
            });
        }
    }
};
