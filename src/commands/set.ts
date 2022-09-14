import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../structures/Command";
import { configs } from "../typings/configs";
import { config } from "../utils/embeds";

export default new Command({
    name: 'set',
    description: "Configure un paramètres de Bender protect",
    ownerOnly: true,
    dm: false,
    run: ({ interaction, args }) => {
        const option = args.getString('option', true) as keyof configs;
        const value = args.getBoolean('valeur', true);

        interaction.client.configsManager.set(interaction.guild.id, option, value);
        interaction.reply({ embeds: [ config(interaction.user, option, value) ] }).catch(() => {});
    },
    options: [
        {
            name: 'option',
            description: "Paramètre à configurer",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true
        },
        {
            name: 'valeur',
            description: "Valeur du paramètre",
            type: ApplicationCommandOptionType.Boolean,
            required: true
        }
    ]
})