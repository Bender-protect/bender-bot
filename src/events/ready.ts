import { AmethystEvent } from 'amethystjs';
import { buildDatabase } from '../utils/database';
import { ActivityType } from 'discord.js';
import { WhitelistManager } from '../managers/Whitelist';

export default new AmethystEvent('ready', async (client) => {
    await buildDatabase();

    client.user.setActivity({
        name: `your servers`,
        type: ActivityType.Watching
    });

    client.Whitelist = new WhitelistManager();
    await client.guilds.fetch();

    client.guilds.cache.forEach((guild) => {
        client.Whitelist.init(guild.id, guild.ownerId);
    });
});

declare module 'discord.js' {
    interface Client {
        Whitelist: WhitelistManager;
    }
}
