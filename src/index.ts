import { AmethystClient } from 'amethystjs';
import { Partials } from 'discord.js';
import { config } from 'dotenv';
config();

export const client = new AmethystClient(
    {
        intents: [
            'GuildBans',
            'Guilds',
            'GuildMembers',
            'AutoModerationExecution',
            'GuildIntegrations',
            'GuildWebhooks',
            'GuildModeration',
            'GuildMessages',
            'MessageContent',
            'GuildEmojisAndStickers'
        ],
        partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
    },
    {
        token: process.env.token,
        debug: true,
        commandsFolder: './dist/commands',
        preconditionsFolder: './dist/preconditions',
        buttonsFolder: './dist/buttons',
        eventsFolder: './dist/events',
        autocompleteListenersFolder: './dist/autocompletes'
    }
);

client.start({});
