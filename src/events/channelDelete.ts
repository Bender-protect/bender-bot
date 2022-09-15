import { AuditLogEvent, GuildChannel, TextChannel } from "discord.js";
import { Bender } from "../bender";
import { Event } from "../structures/Event";
import { classic, notWhitelisted } from "../utils/embeds";
import { ChannelType, VoiceChannel } from "discord.js";

export default new Event('channelDelete', async(chan) => {
    const channel = chan as GuildChannel;
    if (channel.isThread()) return;

    const { guild, id, name, parent, permissionOverwrites, type, position } = channel;
    if (guild) {
        const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete });

        if (logs.entries.size > 0) {
            const { target, executor } = logs.entries.first();
            if (target.id === id) {
                if (!Bender.whitelistManager.isWhitelisted(guild, executor.id) && Bender.configsManager.state(guild.id, 'channelDelete_enable')) {
                    executor.send({ embeds: [ notWhitelisted(executor) ] }).catch(() => {});

                    guild.channels.create({
                        topic: (channel as TextChannel).topic,
                        permissionOverwrites: permissionOverwrites.cache,
                        name: name,
                        type: type as  Exclude<
                        ChannelType,
                        | ChannelType.DM
                        | ChannelType.GroupDM
                        | ChannelType.GuildPublicThread
                        | ChannelType.GuildNewsThread
                        | ChannelType.GuildPrivateThread
                        >,
                        userLimit: (channel as VoiceChannel).userLimit,
                        bitrate: (channel as VoiceChannel).bitrate,
                        parent,
                        position
                    }).then((c) => {
                        if (channel.type === ChannelType.GuildText) {
                            c.setNSFW((channel as TextChannel).nsfw);
                        };
                        
                        if (c.type === ChannelType.GuildText) c.send({ embeds: [ classic(executor)
                            .setTitle("Tentative de suppression")
                            .setDescription(`<@${executor.id}> a tenté de supprimer ce salon, mais il n'était pas whitelisté`)
                            .setColor(guild.members.me.displayHexColor)
                        ] }).catch(() => {});
                    })
                }
            }
        }
    }
})