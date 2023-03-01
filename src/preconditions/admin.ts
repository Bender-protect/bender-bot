import { Precondition } from 'amethystjs';
import { compareWhitelistAccess } from '../utils/toolbox';
import { whitelistAdmin } from '../utils/embeds';

export default new Precondition('whitelist admin')
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
            ).above.includes('admin')
        )
            return {
                ok: false,
                interaction,
                isChatInput: true,
                metadata: {
                    embedKey: 'whitelistAdmin'
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
                'admin'
            )
        ) {
            button
                .reply({
                    ephemeral: true,
                    embeds: [whitelistAdmin(user)]
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
