import { APIOverwrite, AuditLogEvent, ChannelType, GuildChannel, TextChannel, VoiceChannel } from "discord.js";
import { Bender } from "../bender";
import { Event } from "../structures/Event";
import { notWhitelisted } from "../utils/embeds";

export default new Event('channelUpdate', (bef, chan) => {
    const channel = chan as GuildChannel;
    const before = bef as GuildChannel;
    if (channel.guild) {
        channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelUpdate }).then((entries) => {
            if (entries.entries.size > 0 && entries.entries.first().target.id === channel.id) {
                const { executor, changes } = entries.entries.first();

                changes.forEach((change) => {
                    const { key, old } = change;

                    switch (key) {
                        case 'name':
                            channel.setName((old as string));
                        break;
                        case 'topic':
                            (channel as TextChannel).setTopic((old as string));
                        break;
                        case 'position':
                            channel.setPosition((old as number));
                        break;
                        case 'nsfw':
                            (channel as TextChannel).setNSFW(old as boolean);
                        break;
                        case 'bitrate':
                            (channel as VoiceChannel).setBitrate(old as number);
                        break;
                        case 'permissions':
                            channel.permissionOverwrites = before.permissionOverwrites;
                        break;
                    };
                });
                if (!Bender.whitelistManager.isWhitelisted(channel.guild, executor?.id) && Bender.configsManager.state(channel.guild.id, 'channelUpdate_enable')) {
                    executor.send({ embeds: [ notWhitelisted(executor) ] }).catch(() => {});

                    
                };
            };
        });
    }
});