import { AuditLogEvent } from "discord.js";
import { Bender } from "../bender";
import { Event } from "../structures/Event";
import { notWhitelisted } from "../utils/embeds";

export default new Event('guildBanAdd', async(ban) => {
    const { guild, user } = ban;
    const { executor, target } = (await guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd })).entries.first();
    if (target.id === user.id) {
        if (!Bender.whitelistManager.isWhitelisted(guild, executor.id) && !Bender.configsManager.state(guild.id, 'allowBan')) {
            guild.bans.remove(user, 'not whitelisted');

            executor.send({ embeds: [ notWhitelisted(executor) ] }).catch(() => {});
        };
    };
});