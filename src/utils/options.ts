import { ApplicationCommandOption, ApplicationCommandOptionType } from "discord.js";

export const userOption = (options: { description?: string, required?: boolean }) => {
    return {
        name: 'utilisateur',
        description: options?.description ?? 'Utilisateur à gérer',
        required: options?.required ?? true,
        type: ApplicationCommandOptionType.User
    } as ApplicationCommandOption
};
export const reasonOption: ApplicationCommandOption = {
    name: 'raison',
    description: "Raison de votre action",
    required: true,
    type: ApplicationCommandOptionType.String
};
export const proofOption: ApplicationCommandOption = {
    name: 'preuve',
    description: "Preuve en image de votre agissement",
    required: false,
    type: ApplicationCommandOptionType.Attachment
};
export const requiredProofOption = Object.assign(proofOption, { required: true });