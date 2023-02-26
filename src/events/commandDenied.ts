import { AmethystEvent, commandDeniedCode } from 'amethystjs';
import { embedKey } from '../typings/client';
import { systemReply } from '../utils/toolbox';
import * as embeds from '../utils/embeds';

export default new AmethystEvent('commandDenied', (command, reason) => {
    if (!command.interaction) return;

    const included: Record<keyof typeof commandDeniedCode, embedKey> = {
        ChannelNotNsfw: 'channelNotNSFW',
        ClientMissingPerms: 'clientMissingPerm',
        CustomPrecondition: 'CustomPrecondition',
        DMOnly: 'DMOnly',
        GuildOnly: 'guildOnly',
        InvalidChannelType: 'InvalidChannelType',
        OwnerOnly: 'OwnerOnly',
        UnderCooldown: 'underCooldown',
        UnknownChannelType: 'CustomPrecondition',
        UserMissingPerms: 'missingPermission'
    };
    delete included.CustomPrecondition;
    if (included[reason.code]) {
        let param: unknown;
        if (reason.code === commandDeniedCode.UnderCooldown) {
            param = reason.metadata.remainingCooldownTime;
        }
        if (
            [commandDeniedCode.UserMissingPerms, commandDeniedCode.ClientMissingPerms].includes(
                reason.code as unknown as commandDeniedCode
            )
        ) {
            param = reason.metadata.permissions;
        }
        return systemReply(command.interaction, {
            embeds: [embeds[included[reason.code]](command.interaction.user, param)]
        });
    }
    if (reason.metadata.embedKey) {
        systemReply(command.interaction, {
            embeds: [embeds[reason.metadata.embedKey](command.interaction.user)]
        }).catch(() => {});
    }
});
