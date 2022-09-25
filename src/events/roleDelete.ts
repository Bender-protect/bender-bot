import { AuditLogEvent, GuildChannel, TextChannel } from "discord.js";
import { Bender } from "../bender";
import { Event } from "../structures/Event";
import { notWhitelisted } from "../utils/embeds";

export default new Event('roleDelete', async(role) => {
    const { guild, color, unicodeEmoji, position, permissions, name, mentionable, members, hoist } = role;
    const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete });

    const { executor, target, reason } = logs.entries.first();
    if (target.id === role.id) {
        if (!Bender.whitelistManager.isWhitelisted(guild, executor.id, reason) && Bender.configsManager.state(guild.id, 'roleDelete_enable')) {
            const role = await guild.roles.create({
                name,
                mentionable,
                hoist,
                color,
                permissions,
                unicodeEmoji,
                position
            }).catch(() => {});

            if (role) {
                members.forEach((member) => {
                    member.roles.add(role).catch(() => {});
                });
            };
            
            Bender.sanctionsManager.applySanction({ guild: guild, reason: `suppression de rôle`, key: 'roleDelete', member: (await guild.members.fetch(executor)), user: executor.client.user });
            executor.send({ embeds: [ notWhitelisted(executor) ] }).catch(() => {});
        };
    };
});