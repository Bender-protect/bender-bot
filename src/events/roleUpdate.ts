import { AuditLogEvent, ColorResolvable, PermissionResolvable } from "discord.js";
import { Bender } from "../bender";
import { Event } from "../structures/Event";
import { notWhitelisted } from "../utils/embeds";

export default new Event('roleUpdate', async(o, n) => {
    const { guild, id } = n;
    const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.RoleUpdate });

    const { executor, target, changes, reason } = logs.entries.first();
    if (target.id === id) {
        if (!Bender.whitelistManager.isWhitelisted(guild, executor.id, reason) && Bender.configsManager.state(guild.id, 'roleUpdate_enable')) {
            executor.send({ embeds: [ notWhitelisted(executor) ] }).catch(() => {});

            changes.forEach((change) => {
                const { key, old } = change;
                switch (key) {
                    case 'name':
                        n.setName(old as string).catch(() => {});
                    break;
                    case 'color':
                        n.setColor(old as ColorResolvable).catch(() => {});
                    break;
                    case 'position':
                        n.setPosition(old as number);
                    break;
                    case 'mentionable':
                        n.setMentionable(old as boolean);
                    break;
                    case 'hoist':
                        n.setHoist(old as boolean);
                    break;
                    case 'permissions':
                        n.setPermissions(old as PermissionResolvable);
                    break;
                };
            });
            Bender.sanctionsManager.applySanction({ guild: guild, reason: `modification de rôle`, key: 'roleUpdate', member: (await guild.members.fetch(executor)), user: executor.client.user });
        }
    }
})