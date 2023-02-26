import { AnySelectMenuInteraction, ButtonInteraction, CommandInteraction, InteractionReplyOptions } from 'discord.js';
import permissions from '../data/perms.json';
import { whitelistedAccess } from '../typings/database';

export const numerize = (number: number) => number.toLocaleString('en');
export const resize = (str: string, size?: number) => {
    const max = size ?? 100;
    if (str.length <= max) return str;
    return str.substring(0, max - 3) + '...';
};
export const getPerm = (permission: keyof typeof permissions) => {
    return permissions[permission];
};
export const plurial = (nb: number | unknown[], plurial?: { singular?: string; plurial?: string }) => {
    const sg = plurial?.singular ?? '';
    const pl = plurial?.plurial ?? 's';

    const size = nb instanceof Array ? nb.length : nb;
    if (size === 1) return sg;
    return pl;
};
export const systemReply = (
    interaction: CommandInteraction | ButtonInteraction | AnySelectMenuInteraction,
    content: InteractionReplyOptions
) => {
    if (interaction.replied) return interaction.editReply(content);
    return interaction.reply(content);
};
export const compareWhitelistAccess = (access: whitelistedAccess) => {
    const list: whitelistedAccess[] = ['manager', 'mod', 'admin'];
    const index = list.indexOf(access);

    return {
        under: list.filter((v, i) => i < index),
        above: list.filter((v, i) => i > index)
    };
};
