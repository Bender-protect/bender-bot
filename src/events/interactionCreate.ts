import { CommandInteractionOptionResolver } from "discord.js";
import { Bender } from "../bender";
import { Event } from "../structures/Event";
import { BenderInteraction } from "../typings/commandType";
import { noConfigured, notWhitelisted, ownerOnly, sqlError } from "../utils/embeds";

export default new Event('interactionCreate', async(inter) => {
    const interaction = inter as BenderInteraction;
    if (interaction.isCommand()) {
        const cmdName = interaction.commandName;
        const cmd = interaction.client.commands.get(cmdName);

        if (cmd.dm === false && !interaction.guild) return interaction.reply(`Vous ne pouvez exécuter cette commande que sur un serveur`);

        if (cmd?.ownerOnly === true && interaction.guild && interaction.guild.ownerId !== interaction.user.id) return interaction.reply({ embeds: [ ownerOnly(interaction.user, interaction.guild.ownerId) ] })
        if (cmd?.whitelist === true && interaction.guild) {
            if (!Bender.whitelistManager.isWhitelisted(interaction.guild, interaction.user.id)) return interaction.reply({ embeds: [ notWhitelisted(interaction.user) ] }).catch(() => {});
        };

        cmd.run({
            interaction,
            args: interaction.options as CommandInteractionOptionResolver,
            client: interaction.client
        });
    }
});