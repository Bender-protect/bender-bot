import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../structures/Command";
import { configs } from "../typings/configs";
import { config, setup, setupEd } from "../utils/embeds";

export default new Command({
    name: 'set',
    description: "Configure un paramètres de Bender protect",
    ownerOnly: true,
    dm: false,
    run: ({ interaction, args }) => {
        const subcommand = args.getSubcommand();

        if (subcommand === 'initialiser') {
            if (
                interaction.client.configsManager.has(interaction.guild.id) &&
                Object.keys(interaction.client.sanctionsManager.getAll(interaction.guild.id)).length > 0 &&
                Object.keys(interaction.client.antispamDataManager.get(interaction.guild.id)).length > 0
            ) return interaction.reply({ embeds: [ setupEd(interaction.user) ] }).catch(() => {});

            interaction.client.configsManager.setup(interaction.guild.id);
            interaction.client.sanctionsManager.setup(interaction.guild.id);
            interaction.client.antispamDataManager.set(interaction.guild.id, 'count', 6);
            interaction.reply({ embeds: [ setup(interaction.user) ] }).catch(() => {});
        } else {
            const option = args.getString('option', true) as keyof configs;
            const value = args.getBoolean('valeur', true);
    
            interaction.client.configsManager.set(interaction.guild.id, option, value);
            interaction.reply({ embeds: [ config(interaction.user, option, value) ] }).catch(() => {});
        };
    },
    options: [
        {
            name: 'initialiser',
            type: ApplicationCommandOptionType.Subcommand,
            description: "Initialise les configurations de Bender sur votre serveur"
        },
        {
            name: 'configurer',
            type: ApplicationCommandOptionType.Subcommand,
            description: "Configure un paramètre",
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
        }
    ]
})