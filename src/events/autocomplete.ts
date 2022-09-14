import { AutocompleteInteraction } from "discord.js";
import { Event } from "../structures/Event";
import { configTypes } from "../typings/configs";

export default new Event('interactionCreate', (inter) => {
    if (inter.isAutocomplete()) {
        const interaction = inter as AutocompleteInteraction;

        const value = interaction.options.getFocused();

        interaction.respond(configTypes.filter(x => x.name.toLowerCase().includes(value.toLowerCase())));
    }
})