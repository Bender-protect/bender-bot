import { Precondition } from 'amethystjs';
import { compareWhitelistAccess } from '../utils/toolbox';
import { whitelistedAccess } from '../typings/database';

export default new Precondition('whitelist manager').setChatInputRun(({ interaction }) => {
    if (!interaction.guild)
        return {
            ok: true,
            interaction,
            isChatInput: true
        };

    if (
        !compareWhitelistAccess(
            interaction.client.Whitelist.getAccess(interaction.guild.id, interaction.user.id) as whitelistedAccess
        ).under.includes('manager')
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
});
