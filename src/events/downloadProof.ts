import { Event } from "../structures/Event";

export default new Event('interactionCreate', (interaction) => {
    if (interaction.isButton() && interaction.customId === 'proof-download') {
        const { url } = interaction.message.embeds[0].image;
        
        interaction.reply({ content: url, ephemeral: true }).catch(() => {});
    }
})