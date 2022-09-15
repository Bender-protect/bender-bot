import { Event } from "../structures/Event";

const cache: {[key: string]: Map<string, number>} = {};

export default new Event('messageCreate', (message) => {
    if (!cache[message.guild.id]) cache[message.guild.id] = new Map();

    const userData = cache[message.guild.id].get(message.author.id) || 0;
});