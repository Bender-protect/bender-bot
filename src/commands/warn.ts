import { ApplicationCommandOption, ApplicationCommandOptionType } from "discord.js";
import { Command } from "../structures/Command";

const userOption: ApplicationCommandOption = {
    name: 'utilisateur',
    description: "Utilisateur à gérer",
    required: true,
    type: ApplicationCommandOptionType.User
}
export default new Command({
    name: 'avertissement',
    description: "Gère les avertissements d'un utilisateur",
    dm: false,
    whitelist: true,
    options: [],
    run: async({ interaction, args }) => {

    }
})