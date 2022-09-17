import { Bender } from "../bender";
import { Event } from "../structures/Event";

const cache: {[key: string]: Map<string, number>} = {};

export default new Event('messageCreate', (message) => {
    if (!message.guild) return;
    if (Bender.whitelistManager.isWhitelisted(message.guild, message.author.id)) return;
    if (!cache[message.guild.id]) cache[message.guild.id] = new Map();

    const userData = cache[message.guild.id].get(message.author.id) || 0;
    const { count, time } = Bender.antispamDataManager.get(message.guild.id);

    if (userData === 0) {
        setTimeout(() => {
            cache[message.guild.id].delete(message.author.id);
        }, time * 1000);
    };

    cache[message.guild.id].set(message.author.id, userData + 1);
    if (userData + 1 === count) {
        Bender.sanctionsManager.applySanction({ guild: message.guild, user: message.client.user, member: message.member, reason: `Spam`, key: 'spam' });
    };
});