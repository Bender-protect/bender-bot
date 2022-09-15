import { AuditLogEvent } from "discord.js";
import { Bender } from "../bender";
import { Event } from "../structures/Event";
import { notWhitelisted } from "../utils/embeds";

export default new Event('channelCreate', (channel) => {
    if (channel.guild) {
        channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate }).then((entries) => {
            if (entries.entries.size > 0 && entries.entries.first().target.id === channel.id) {
                const { executor } = entries.entries.first();
                if (!Bender.whitelistManager.isWhitelisted(channel.guild, executor?.id) && Bender.configsManager.state(channel.guild.id, 'channelCreate_enable')) {
                    executor.send({ embeds: [ notWhitelisted(executor) ] }).catch(() => {});

                    channel.delete().catch(() => {});
                };
            };
        });
    }
});