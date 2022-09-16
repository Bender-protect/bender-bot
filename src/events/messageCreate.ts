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
        message.member.timeout(time * 1000, `Spam (Limite de ${count} messages par ${time} secondes [soit ${(count / time).toFixed(1)} messages par seconde pour les matheux])`).catch(() => {});
    }
});