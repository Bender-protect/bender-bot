import { Precondition } from 'amethystjs';

export default new Precondition('whitelised').setChatInputRun(({ interaction }) => {
    if (!interaction.guild)
        return {
            ok: true,
            interaction,
            isChatInput: true
        };

    if (!interaction.client.Whitelist.isWhitelisted(interaction.guild.id, interaction.user.id))
        return {
            ok: false,
            interaction,
            isChatInput: true,
            metadata: {
                embedKey: 'notWhitelisted'
            }
        };
    return {
        ok: true,
        interaction,
        isChatInput: true
    };
});
