import { EmbedBuilder, PermissionsString, User } from 'discord.js';
import { getPerm, plurial } from './toolbox';

const base = (user: User) => {
    return new EmbedBuilder().setTimestamp().setFooter({
        text: user.username,
        iconURL: user.displayAvatarURL({ forceStatic: false })
    });
};
export const cancel = () => {
    return new EmbedBuilder().setTitle(':bulb: Cancel').setColor('Yellow');
};
export const basicEmbed = base;
export const notWhitelisted = (user: User) => {
    return base(user)
        .setTitle('🚫 Not whitelisted')
        .setDescription(`You are not allowed to use this command because you are not whitelised on the server`)
        .setColor('#ff0000');
};
export const missingPermission = (user: User, permissions: PermissionsString[]) => {
    return base(user)
        .setTitle('🚫 Missing permission')
        .setDescription(
            `You are missing the permission${plurial(permissions)} ${
                permissions.length === 1
                    ? `\`${getPerm(permissions[0])}\``
                    : permissions.map((p) => `\`${getPerm(p)}\``).join(', ')
            } to run this command`
        )
        .setColor('#ff0000');
};
export const DMOnly = (user: User) => {
    return base(user)
        .setTitle('🚫 DM only')
        .setDescription(`This command is usable only in direct messages`)
        .setColor('#ff0000');
};
export const InvalidChannelType = (user: User) => {
    return base(user)
        .setTitle('🚫 Invalid channel type')
        .setDescription(`Please run this command in a valid channel type (It is often a text channel)`)
        .setColor('#ff0000');
};
export const OwnerOnly = (user: User) => {
    return base(user)
        .setTitle('🚫 Owner only')
        .setDescription(`This command is usable only by the owner of the server`)
        .setColor('#ff0000');
};
export const underCooldown = (user: User, remainingTime: number) => {
    return base(user)
        .setTitle('🚫 Under cooldown')
        .setDescription(`You are actually under cooldown, please try again in ${(remainingTime / 1000).toFixed(1)}s`)
        .setColor('#ff0000');
};
export const CustomPrecondition = () => {
    return new EmbedBuilder();
};
export const clientMissingPerm = (user: User, permissions: PermissionsString[]) => {
    return base(user)
        .setTitle('🚫 Missing permission')
        .setDescription(
            `I am missing the permission${plurial(permissions)} ${
                permissions.length === 1
                    ? `\`${getPerm(permissions[0])}\``
                    : permissions.map((p) => `\`${getPerm(p)}\``).join(', ')
            } to run this command`
        )
        .setColor('#ff0000');
};
export const channelNotNSFW = (user: User) => {
    return base(user)
        .setTitle('🚫 Channel not NSFW')
        .setDescription(`This command is usable only in an NSFW channel`)
        .setColor('#ff0000');
};
export const guildOnly = (user: User) => {
    return base(user)
        .setTitle('🚫 Guild only')
        .setDescription(`This command is usable only in a server`)
        .setColor('#ff0000');
};
export const whitelistManager = (user: User) => {
    return base(user)
        .setTitle('🚫 Not manager')
        .setDescription(`You are not a manager to run this command`)
        .setColor('#ff0000');
};
export const whitelistMod = (user: User) => {
    return base(user)
        .setTitle('🚫 Not moderator')
        .setDescription(`You are not a moderator to run this command`)
        .setColor('#ff0000');
};
export const whitelistAdmin = (user: User) => {
    return base(user)
        .setTitle('🚫 Not administrator')
        .setDescription(`You are not an administrator to run this command`)
        .setColor('#ff0000');
};
