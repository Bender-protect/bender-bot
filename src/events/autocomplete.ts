import { AutocompleteInteraction } from "discord.js";
import { Event } from "../structures/Event";
import { configs } from "../typings/configs";

export default new Event('interactionCreate', (inter) => {
    if (inter.isAutocomplete()) {
        const interaction = inter as AutocompleteInteraction;

        const { value } = interaction.options.getFocused(true);

        
        interaction.respond()
    }
})