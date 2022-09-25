import { AuditLogEvent } from "discord.js";
import { Bender } from "../bender";
import { Event } from "../structures/Event";
import { notWhitelisted } from "../utils/embeds";

export default new Event('roleCreate', (role) => {
    if (role.guild) {
        role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate }).then(async(entries) => {
            if (entries.entries.size > 0 && entries.entries.first().target.id === role.id) {
                const { executor, reason } = entries.entries.first();
                if (!Bender.whitelistManager.isWhitelisted(role.guild, executor?.id, reason) && Bender.configsManager.state(role.guild.id, 'roleCreate_enable')) {
                    executor.send({ embeds: [ notWhitelisted(executor) ] }).catch(() => {});

                    Bender.sanctionsManager.applySanction({ guild: role.guild, reason: `création de rôle`, key: 'roleCreate', member: (await role.guild.members.fetch(executor)), user: executor.client.user });
                    role.delete().catch(() => {});
                };
            };
        });
    }
});