const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('Auto-Nickname-Prefix Verwaltung')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Fügt einen Auto-Prefix für eine Rolle hinzu')
                .addRoleOption(option =>
                    option.setName('rolle')
                        .setDescription('Rolle')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('prefix')
                        .setDescription('Prefix (z.B. [Partner], [Support])')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Entfernt einen Auto-Prefix')
                .addRoleOption(option =>
                    option.setName('rolle')
                        .setDescription('Rolle')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Zeigt alle Auto-Prefixes')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        let config = GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!config) {
            config = GuildConfig.create(interaction.guild.id);
        }
        
        if (!config.nicknamePrefixes) {
            config.nicknamePrefixes = [];
        }
        
        if (subcommand === 'add') {
            const role = interaction.options.getRole('rolle');
            const prefix = interaction.options.getString('prefix');
            
            // Prüfe ob bereits existiert
            const existing = config.nicknamePrefixes.find(p => p.roleId === role.id);
            if (existing) {
                existing.prefix = prefix;
            } else {
                config.nicknamePrefixes.push({
                    roleId: role.id,
                    prefix: prefix
                });
            }
            
            GuildConfig.save(config);
            
            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`✅ Auto-Prefix **${prefix}** für ${role} eingerichtet!\n\nUser mit dieser Rolle bekommen automatisch den Prefix im Nickname.`);
            
            await interaction.reply({ embeds: [embed] });
            
        } else if (subcommand === 'remove') {
            const role = interaction.options.getRole('rolle');
            
            config.nicknamePrefixes = config.nicknamePrefixes.filter(p => p.roleId !== role.id);
            GuildConfig.save(config);
            
            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`✅ Auto-Prefix für ${role} entfernt!`);
            
            await interaction.reply({ embeds: [embed] });
            
        } else if (subcommand === 'list') {
            if (config.nicknamePrefixes.length === 0) {
                return await interaction.reply({ 
                    content: '❌ Keine Auto-Prefixes konfiguriert!', 
                    ephemeral: true 
                });
            }
            
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🏷️ Auto-Nickname-Prefixes')
                .setDescription(`${config.nicknamePrefixes.length} Prefix(e) konfiguriert`);
            
            for (const prefixData of config.nicknamePrefixes) {
                const role = await interaction.guild.roles.fetch(prefixData.roleId).catch(() => null);
                if (role) {
                    embed.addFields({
                        name: role.name,
                        value: `Prefix: **${prefixData.prefix}**`,
                        inline: true
                    });
                }
            }
            
            await interaction.reply({ embeds: [embed] });
        }
    }
};
