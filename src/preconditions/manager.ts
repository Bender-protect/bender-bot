import { Precondition } from 'amethystjs';
import { compareWhitelistAccess } from '../utils/toolbox';
import { whitelistManager } from '../utils/embeds';

export default new Precondition('whitelist manager')
    .setChatInputRun(({ interaction }) => {
        if (!interaction.guild)
            return {
                ok: true,
                interaction,
                isChatInput: true
            };

        if (
            compareWhitelistAccess(
                interaction.client.Whitelist.getAccess<true>(interaction.guild.id, interaction.user.id)
            ).above.includes('manager')
        )
            return {
                ok: false,
                interaction,
                isChatInput: true,
                metadata: {
                    embedKey: 'whitelistManager'
                }
            };
        return {
            ok: true,
            interaction,
            isChatInput: true
        };
    })
    .setButtonRun(({ button, user }) => {
        if (!button.guild) return { ok: true, isChatInput: false, isButton: true, button };

        if (
            compareWhitelistAccess(button.client.Whitelist.getAccess<true>(button.guild.id, user.id)).above.includes(
                'manager'
            )
        ) {
            button
                .reply({
                    ephemeral: true,
                    embeds: [whitelistManager(user)]
                })
                .catch(() => {});
            return {
                ok: false,
                isChatInput: false,
                isButton: true,
                button
            };
        }
        return {
            ok: true,
            isChatInput: false,
            isButton: true,
            button
        };
    });
