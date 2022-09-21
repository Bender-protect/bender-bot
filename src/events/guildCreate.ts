import { ChannelType, TextChannel, WebhookClient } from "discord.js";
import { Bender } from "../bender";
import { Event } from "../structures/Event";
import { guildCreateMsg } from "../utils/embeds";

export default new Event('guildCreate', (guild) => {
    const webhook = new WebhookClient({ url: process.env.webhook });

    (guild.channels.cache.filter(x => x.type === ChannelType.GuildText).first() as TextChannel).send({ embeds: [ guildCreateMsg(Bender) ], files: [ `./logo.png` ] }).catch(() => {});
    webhook.send({ content: `Ajouté sur ${guild.name} ( \`${guild.id}\` ${guild.memberCount} membres )` }).catch(() => {});
});