import { AuditLogEvent } from "discord.js";
import { Bender } from "../bender";
import { Event } from "../structures/Event";
import { notWhitelisted } from "../utils/embeds";

export default new Event('channelCreate', (channel) => {
    const { guild } = channel;
    if (guild) {
        guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate }).then(async(entries) => {
            if (entries.entries.size > 0 && entries.entries.first().target.id === channel.id) {
                const { executor, reason } = entries.entries.first();
                if (!Bender.whitelistManager.isWhitelisted(channel.guild, executor?.id, reason) && Bender.configsManager.state(channel.guild.id, 'channelCreate_enable')) {
                    executor.send({ embeds: [ notWhitelisted(executor) ] }).catch(() => {});

                    channel.delete().catch(() => {});
                    Bender.sanctionsManager.applySanction({ guild, reason: `création de salon`, key: 'channelCreate', member: (await guild.members.fetch(executor)), user: executor.client.user });
                };
            };
        });
    }
});