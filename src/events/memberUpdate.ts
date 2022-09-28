import { AuditLogEvent, GuildMemberEditData } from "discord.js";
import { Bender } from "../bender";
import { Event } from "../structures/Event";
import { notWhitelisted } from "../utils/embeds";

export default new Event('guildMemberUpdate', async(o, n) => {
    const { executor, reason, target } = (await n.guild.fetchAuditLogs({ type: AuditLogEvent.MemberUpdate })).entries.first();
    if (target.id === n.id && Bender.configsManager.state(n.guild.id, 'member_update') && !Bender.whitelistManager.isWhitelisted(n.guild, executor.id, reason)) {
        let run = true;
        if (o.id === n.id && !Bender.configsManager.state(n.guild.id, 'member_update_strict')) run = false;
        if (!run) return;

        const data = o as unknown as GuildMemberEditData;
        data.roles = o.roles.cache;

        n.edit(data).catch(() => {});
        executor.send({ embeds: [ notWhitelisted(executor) ] }).catch(() => {});
    }
});