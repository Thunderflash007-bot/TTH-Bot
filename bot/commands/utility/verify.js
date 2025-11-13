const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Verifiziere dich auf dem Server')
        .addStringOption(option =>
            option.setName('passcode')
                .setDescription('Verifizierungs-Passcode')
                .setRequired(true)),
    
    async execute(interaction) {
        const passcode = interaction.options.getString('passcode');
        
        const config = GuildConfig.findOne({ guildId: interaction.guild.id });
        
        if (!config || !config.verificationPasscode) {
            return await interaction.reply({ 
                content: '❌ Verifizierungs-System ist nicht eingerichtet!', 
                ephemeral: true 
            });
        }
        
        if (passcode !== config.verificationPasscode) {
            return await interaction.reply({ 
                content: '❌ Falscher Passcode!', 
                ephemeral: true 
            });
        }
        
        const role = await interaction.guild.roles.fetch(config.verificationRoleId);
        
        if (!role) {
            return await interaction.reply({ 
                content: '❌ Verifizierungs-Rolle nicht gefunden!', 
                ephemeral: true 
            });
        }
        
        const member = await interaction.guild.members.fetch(interaction.user.id);
        
        if (member.roles.cache.has(role.id)) {
            return await interaction.reply({ 
                content: '✅ Du bist bereits verifiziert!', 
                ephemeral: true 
            });
        }
        
        await member.roles.add(role);
        
        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Erfolgreich verifiziert!')
            .setDescription(`Du hast die Rolle ${role} erhalten!`)
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        
        // Log
        if (config.logChannelId) {
            try {
                const logChannel = await interaction.guild.channels.fetch(config.logChannelId);
                const logEmbed = new EmbedBuilder()
                    .setColor('#57F287')
                    .setDescription(`✅ ${interaction.user} hat sich erfolgreich verifiziert!`)
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            } catch (error) {
                // Log-Channel nicht verfügbar
            }
        }
    }
};
