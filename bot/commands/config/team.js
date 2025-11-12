const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team')
        .setDescription('Team-Verwaltung')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add-role')
                .setDescription('Fügt eine Rolle zum Team hinzu')
                .addRoleOption(option =>
                    option.setName('rolle')
                        .setDescription('Die Team-Rolle')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('rang')
                        .setDescription('Der Rang/Position')
                        .setRequired(true)
                        .addChoices(
                            { name: '👑 Owner', value: 'owner' },
                            { name: '⚡ Admin', value: 'admin' },
                            { name: '🛡️ Moderator', value: 'moderator' },
                            { name: '💬 Supporter', value: 'supporter' },
                            { name: '🎨 Developer', value: 'developer' },
                            { name: '📝 Content Creator', value: 'content' },
                            { name: '🎯 Trial', value: 'trial' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-role')
                .setDescription('Entfernt eine Rolle vom Team')
                .addRoleOption(option =>
                    option.setName('rolle')
                        .setDescription('Die Team-Rolle')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Zeigt alle Team-Mitglieder an'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('roles')
                .setDescription('Zeigt alle Team-Rollen an')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add-role') {
            const role = interaction.options.getRole('rolle');
            const rank = interaction.options.getString('rang');

            let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
            if (!config) {
                config = {
                    guildId: interaction.guild.id,
                    teamRoles: []
                };
            }

            if (!config.teamRoles) config.teamRoles = [];

            // Prüfe ob Rolle bereits existiert
            const existingIndex = config.teamRoles.findIndex(r => r.roleId === role.id);
            if (existingIndex !== -1) {
                config.teamRoles[existingIndex].rank = rank;
            } else {
                config.teamRoles.push({
                    roleId: role.id,
                    rank: rank
                });
            }

            await GuildConfig.save(config);

            const rankEmojis = {
                owner: '👑',
                admin: '⚡',
                moderator: '🛡️',
                supporter: '💬',
                developer: '🎨',
                content: '📝',
                trial: '🎯'
            };

            const rankNames = {
                owner: 'Owner',
                admin: 'Admin',
                moderator: 'Moderator',
                supporter: 'Supporter',
                developer: 'Developer',
                content: 'Content Creator',
                trial: 'Trial'
            };

            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setAuthor({ 
                    name: 'Team-Rolle hinzugefügt',
                    iconURL: interaction.guild.iconURL()
                })
                .setDescription(`✅ ${role} wurde als **${rankEmojis[rank]} ${rankNames[rank]}** zum Team hinzugefügt!`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'remove-role') {
            const role = interaction.options.getRole('rolle');

            let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
            if (!config || !config.teamRoles) {
                return interaction.reply({ content: '❌ Keine Team-Rollen konfiguriert!', ephemeral: true });
            }

            const index = config.teamRoles.findIndex(r => r.roleId === role.id);
            if (index === -1) {
                return interaction.reply({ content: '❌ Diese Rolle ist keine Team-Rolle!', ephemeral: true });
            }

            config.teamRoles.splice(index, 1);
            await GuildConfig.save(config);

            const embed = new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription(`✅ ${role} wurde vom Team entfernt!`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'roles') {
            let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
            
            if (!config || !config.teamRoles || config.teamRoles.length === 0) {
                return interaction.reply({ content: '❌ Keine Team-Rollen konfiguriert!', ephemeral: true });
            }

            const rankEmojis = {
                owner: '👑',
                admin: '⚡',
                moderator: '🛡️',
                supporter: '💬',
                developer: '🎨',
                content: '📝',
                trial: '🎯'
            };

            const rankNames = {
                owner: 'Owner',
                admin: 'Admin',
                moderator: 'Moderator',
                supporter: 'Supporter',
                developer: 'Developer',
                content: 'Content Creator',
                trial: 'Trial'
            };

            const roleList = config.teamRoles
                .map(tr => {
                    const role = interaction.guild.roles.cache.get(tr.roleId);
                    return role ? `${rankEmojis[tr.rank]} **${rankNames[tr.rank]}** • ${role}` : null;
                })
                .filter(r => r !== null)
                .join('\n') || 'Keine Rollen gefunden';

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setAuthor({ 
                    name: 'Team-Rollen',
                    iconURL: interaction.guild.iconURL()
                })
                .setDescription(roleList)
                .setFooter({ text: `${config.teamRoles.length} Team-Rollen` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'list') {
            await interaction.deferReply();

            let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
            
            if (!config || !config.teamRoles || config.teamRoles.length === 0) {
                return interaction.editReply({ content: '❌ Keine Team-Rollen konfiguriert! Verwende `/team add-role` zuerst.' });
            }

            const rankEmojis = {
                owner: '👑',
                admin: '⚡',
                moderator: '🛡️',
                supporter: '💬',
                developer: '🎨',
                content: '📝',
                trial: '🎯'
            };

            const rankNames = {
                owner: 'Owner',
                admin: 'Admin',
                moderator: 'Moderator',
                supporter: 'Supporter',
                developer: 'Developer',
                content: 'Content Creator',
                trial: 'Trial'
            };

            const rankOrder = ['owner', 'admin', 'moderator', 'supporter', 'developer', 'content', 'trial'];

            // Sortiere nach Rang
            const sortedRoles = config.teamRoles.sort((a, b) => 
                rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank)
            );

            // Hole alle Mitglieder
            await interaction.guild.members.fetch();

            const teamMembers = [];
            for (const teamRole of sortedRoles) {
                const role = interaction.guild.roles.cache.get(teamRole.roleId);
                if (!role) continue;

                const members = role.members.map(m => m);
                if (members.length > 0) {
                    teamMembers.push({
                        rank: teamRole.rank,
                        rankName: rankNames[teamRole.rank],
                        emoji: rankEmojis[teamRole.rank],
                        role: role,
                        members: members
                    });
                }
            }

            if (teamMembers.length === 0) {
                return interaction.editReply({ content: '❌ Keine Team-Mitglieder gefunden!' });
            }

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setAuthor({ 
                    name: `Team von ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL()
                })
                .setThumbnail(interaction.guild.iconURL({ size: 256 }));

            let totalMembers = 0;
            for (const team of teamMembers) {
                const memberList = team.members
                    .slice(0, 10)
                    .map(m => `• ${m.user.tag}`)
                    .join('\n');
                
                const extra = team.members.length > 10 ? `\n*... und ${team.members.length - 10} weitere*` : '';
                
                embed.addFields({
                    name: `${team.emoji} ${team.rankName} (${team.members.length})`,
                    value: memberList + extra,
                    inline: false
                });

                totalMembers += team.members.length;
            }

            embed.setFooter({ text: `Gesamt: ${totalMembers} Team-Mitglieder` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    }
};
