import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../structures/Command";

export default new Command({
    name: 'set',
    description: "Configure un paramètres de Bender protect",
    ownerOnly: true,
    dm: false,
    run: ({ interaction, args }) => {

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