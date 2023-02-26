import { AmethystEvent } from 'amethystjs';
import { buildDatabase } from '../utils/database';
import { ActivityType } from 'discord.js';

export default new AmethystEvent('ready', async (client) => {
    await buildDatabase();

    client.user.setActivity({
        name: `your servers`,
        type: ActivityType.Watching
    });
});
