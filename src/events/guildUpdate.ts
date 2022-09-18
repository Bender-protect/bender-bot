import { AuditLogEvent, GuildDefaultMessageNotifications, VoiceChannelResolvable } from "discord.js";
import { Bender } from "../bender";
import { Event } from "../structures/Event";
import { notWhitelisted } from "../utils/embeds";

export default new Event('guildUpdate', async(o, a) => {
    const { executor } = (await a.fetchAuditLogs({ type: AuditLogEvent.GuildUpdate })).entries.first();
    if (!Bender.whitelistManager.isWhitelisted(a, executor.id) && Bender.configsManager.state(a.id, 'guildUpdate_enable')) {
        executor.send({ embeds: [ notWhitelisted(executor) ] }).catch(() => {});
        Bender.sanctionsManager.applySanction({
            guild: a,
            member: a.members.cache.get(executor.id),
            user: a.members.me.user,
            reason: "modification de serveur",
            key: 'guildUpdate'
        });

        a.edit(o).catch(() => {});
    };
});