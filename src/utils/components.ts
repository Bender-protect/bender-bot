import { ButtonBuilder, ButtonStyle, SelectMenuBuilder } from "discord.js";

export const sanctionSelector = new SelectMenuBuilder()
    .setCustomId('sanction-select-menu')
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions(
        {
            label: 'Bannissement',
            value: 'ban',
            description: "Bannir le membre"
        },
        {
            label: 'Expulsion',
            value: 'kick',
            description: "Expulser le membre"
        },
        {
            label: 'Avertissement',
            value: 'warn',
            description: "Avertir le membre"
        },
        {
            label: 'Temp-ban',
            value: 'tempban',
            description: "Bannir temporairement le membre"
        },
        {
            label: 'Mute',
            description: "Muter le membre",
            value: 'mute'
        }
    );
export const cancelButton = new ButtonBuilder()
    .setCustomId('cancel')
    .setLabel('Annuler')
    .setStyle(ButtonStyle.Danger);
export const yesBtn = new ButtonBuilder()
    .setCustomId('yes')
    .setStyle(ButtonStyle.Success)
    .setLabel('Oui');
export const noBtn = new ButtonBuilder()
    .setCustomId('no')
    .setLabel('Non')
    .setStyle(ButtonStyle.Danger);