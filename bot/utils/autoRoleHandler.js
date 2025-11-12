// Auto-Role Handler für automatische Rollenvergabe
const AutoRole = require('../models/AutoRole');
const User = require('../models/User');

class AutoRoleHandler {
    constructor(client) {
        this.client = client;
        this.memberJoinTimes = new Map();
    }

    async handleMemberJoin(member) {
        try {
            const autoRoles = AutoRole.find({ 
                guildId: member.guild.id, 
                type: 'join',
                enabled: true 
            });

            for (const autoRole of autoRoles) {
                const role = await member.guild.roles.fetch(autoRole.roleId);
                if (role) {
                    await member.roles.add(role);
                    console.log(`✅ Auto-Role "${role.name}" vergeben an ${member.user.tag}`);
                }
            }

            // Speichere Join-Zeit für time-based roles
            this.memberJoinTimes.set(member.id, Date.now());
            this.scheduleTimedRoles(member);
        } catch (error) {
            console.error('Fehler bei Auto-Role Join:', error);
        }
    }

    async handleLevelUp(member, newLevel) {
        try {
            const autoRoles = AutoRole.find({ 
                guildId: member.guild.id, 
                type: 'level',
                enabled: true 
            });

            for (const autoRole of autoRoles) {
                if (newLevel >= autoRole.level) {
                    const role = await member.guild.roles.fetch(autoRole.roleId);
                    if (role && !member.roles.cache.has(role.id)) {
                        await member.roles.add(role);
                        console.log(`✅ Level-Role "${role.name}" vergeben an ${member.user.tag} (Level ${newLevel})`);
                    }
                }
            }
        } catch (error) {
            console.error('Fehler bei Auto-Role Level:', error);
        }
    }

    async handleBoost(member) {
        try {
            const autoRoles = AutoRole.find({ 
                guildId: member.guild.id, 
                type: 'boost',
                enabled: true 
            });

            for (const autoRole of autoRoles) {
                const role = await member.guild.roles.fetch(autoRole.roleId);
                if (role) {
                    await member.roles.add(role);
                    console.log(`✅ Boost-Role "${role.name}" vergeben an ${member.user.tag}`);
                }
            }
        } catch (error) {
            console.error('Fehler bei Auto-Role Boost:', error);
        }
    }

    scheduleTimedRoles(member) {
        const autoRoles = AutoRole.find({ 
            guildId: member.guild.id, 
            type: 'time',
            enabled: true 
        });

        for (const autoRole of autoRoles) {
            let delayMs = 0;
            
            if (autoRole.timeUnit === 'hours') {
                delayMs = autoRole.timeValue * 60 * 60 * 1000;
            } else if (autoRole.timeUnit === 'days') {
                delayMs = autoRole.timeValue * 24 * 60 * 60 * 1000;
            } else if (autoRole.timeUnit === 'weeks') {
                delayMs = autoRole.timeValue * 7 * 24 * 60 * 60 * 1000;
            }

            setTimeout(async () => {
                try {
                    const role = await member.guild.roles.fetch(autoRole.roleId);
                    if (role && member.roles.cache && !member.roles.cache.has(role.id)) {
                        await member.roles.add(role);
                        console.log(`✅ Timed-Role "${role.name}" vergeben an ${member.user.tag}`);
                    }
                } catch (error) {
                    console.error('Fehler bei Timed Auto-Role:', error);
                }
            }, delayMs);
        }
    }

    // Wird vom messageCreate Event aufgerufen
    async checkLevelRoles(userId, guildId) {
        try {
            const user = User.findOne({ userId, guildId });
            if (!user) return;

            const guild = await this.client.guilds.fetch(guildId);
            const member = await guild.members.fetch(userId);

            await this.handleLevelUp(member, user.level);
        } catch (error) {
            console.error('Fehler beim Check Level-Roles:', error);
        }
    }
}

module.exports = AutoRoleHandler;
