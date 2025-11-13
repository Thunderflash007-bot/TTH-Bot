const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const CustomCommand = require('../../models/CustomCommand');
const GlobalSettings = require('../../models/GlobalSettings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('customcmd')
        .setDescription('Verwalte Custom Commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Liste alle Custom Commands auf'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Zeige Details zu einem Command')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name des Commands')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('toggle')
                .setDescription('Aktiviere/Deaktiviere einen Command')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name des Commands')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('test')
                .setDescription('Teste einen Custom Command')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name des Commands')
                        .setRequired(true))),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        // Feature Check
        if (!GlobalSettings.isFeatureEnabled('customCommands')) {
            const settings = GlobalSettings.getSettings();
            const reason = settings.features.customCommands?.reason || 'Dieses Feature ist vorübergehend deaktiviert.';
            
            const embed = new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle('❌ Feature deaktiviert')
                .setDescription(`Custom Commands sind derzeit deaktiviert.\n\n**Grund:** ${reason}`)
                .setFooter({ text: 'Kontaktiere einen Administrator' });
            
            return await interaction.editReply({ embeds: [embed] });
        }
        
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'list') {
            const commands = CustomCommand.find({ guildId: interaction.guild.id });
            
            if (commands.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#FEE75C')
                    .setTitle('📋 Custom Commands')
                    .setDescription('Es wurden noch keine Custom Commands erstellt.\n\n**Tipp:** Erstelle Commands im Web-Dashboard unter Automation → Custom Commands')
                    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
                
                return await interaction.editReply({ embeds: [embed] });
            }
            
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('📋 Custom Commands')
                .setDescription(`Gesamt: **${commands.length}** Command(s)\n\u200b`)
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
            
            // Gruppiere nach Status
            const enabled = commands.filter(c => c.enabled);
            const disabled = commands.filter(c => !c.enabled);
            
            if (enabled.length > 0) {
                const list = enabled
                    .map(c => `\`!${c.name}\` - ${c.uses || 0} Nutzungen`)
                    .join('\n');
                embed.addFields({ name: '✅ Aktiv', value: list, inline: false });
            }
            
            if (disabled.length > 0) {
                const list = disabled
                    .map(c => `\`!${c.name}\``)
                    .join('\n');
                embed.addFields({ name: '❌ Deaktiviert', value: list, inline: false });
            }
            
            await interaction.editReply({ embeds: [embed] });
            
        } else if (subcommand === 'info') {
            const name = interaction.options.getString('name').toLowerCase();
            const command = CustomCommand.findOne({ guildId: interaction.guild.id, name });
            
            if (!command) {
                return await interaction.editReply({ 
                    content: `❌ Command \`!${name}\` nicht gefunden!`,
                    ephemeral: true 
                });
            }
            
            const embed = new EmbedBuilder()
                .setColor(command.enabled ? '#57F287' : '#ED4245')
                .setTitle(`ℹ️ Command: !${command.name}`)
                .addFields(
                    { name: '📝 Response', value: `\`\`\`${command.response.substring(0, 100)}${command.response.length > 100 ? '...' : ''}\`\`\``, inline: false },
                    { name: '🎨 Embed', value: command.useEmbed ? '✅ Ja' : '❌ Nein', inline: true },
                    { name: '🗑️ Delete Invoke', value: command.deleteInvoke ? '✅ Ja' : '❌ Nein', inline: true },
                    { name: '📊 Status', value: command.enabled ? '✅ Aktiv' : '❌ Deaktiviert', inline: true },
                    { name: '📈 Nutzungen', value: `${command.uses || 0}x`, inline: true },
                    { name: '📅 Erstellt', value: new Date(command.createdAt).toLocaleDateString('de-DE'), inline: true }
                )
                .setFooter({ text: `ID: ${command._id}` });
            
            if (command.lastUsed) {
                embed.addFields({ 
                    name: '🕐 Zuletzt verwendet', 
                    value: new Date(command.lastUsed).toLocaleString('de-DE'), 
                    inline: true 
                });
            }
            
            await interaction.editReply({ embeds: [embed] });
            
        } else if (subcommand === 'toggle') {
            const name = interaction.options.getString('name').toLowerCase();
            const command = CustomCommand.findOne({ guildId: interaction.guild.id, name });
            
            if (!command) {
                return await interaction.editReply({ 
                    content: `❌ Command \`!${name}\` nicht gefunden!` 
                });
            }
            
            command.enabled = !command.enabled;
            CustomCommand.save(command);
            
            const embed = new EmbedBuilder()
                .setColor(command.enabled ? '#57F287' : '#FEE75C')
                .setDescription(`${command.enabled ? '✅' : '⏸️'} Command \`!${name}\` wurde ${command.enabled ? 'aktiviert' : 'deaktiviert'}!`)
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
            
            await interaction.editReply({ embeds: [embed] });
            
        } else if (subcommand === 'test') {
            const name = interaction.options.getString('name').toLowerCase();
            const command = CustomCommand.findOne({ guildId: interaction.guild.id, name });
            
            if (!command) {
                return await interaction.editReply({ 
                    content: `❌ Command \`!${name}\` nicht gefunden!` 
                });
            }
            
            // Variablen ersetzen
            let response = command.response;
            response = response.replace(/{user}/g, interaction.user.username);
            response = response.replace(/{user\.tag}/g, interaction.user.tag);
            response = response.replace(/{user\.id}/g, interaction.user.id);
            response = response.replace(/{mention}/g, `<@${interaction.user.id}>`);
            response = response.replace(/{server}/g, interaction.guild.name);
            response = response.replace(/{server\.id}/g, interaction.guild.id);
            response = response.replace(/{members}/g, interaction.guild.memberCount);
            response = response.replace(/{channel}/g, interaction.channel.name);
            response = response.replace(/{channel\.mention}/g, `<#${interaction.channel.id}>`);
            response = response.replace(/{args}/g, 'test args');
            response = response.replace(/{args\.0}/g, 'arg1');
            response = response.replace(/{args\.1}/g, 'arg2');
            
            const now = new Date();
            response = response.replace(/{date}/g, now.toLocaleDateString('de-DE'));
            response = response.replace(/{time}/g, now.toLocaleTimeString('de-DE'));
            
            if (command.useEmbed) {
                const embed = new EmbedBuilder()
                    .setDescription(response)
                    .setColor(command.embedColor || '#5865F2')
                    .setFooter({ text: '🧪 Test-Modus', iconURL: interaction.guild.iconURL() })
                    .setTimestamp();
                
                await interaction.editReply({ 
                    content: `🧪 **Test-Vorschau für \`!${name}\`:**`,
                    embeds: [embed] 
                });
            } else {
                await interaction.editReply({ 
                    content: `🧪 **Test-Vorschau für \`!${name}\`:**\n\n${response}` 
                });
            }
        }
    }
};
