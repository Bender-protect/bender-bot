import { ApplicationCommandOption, ApplicationCommandOptionType } from "discord.js";
import { Bender } from "../bender";
import { Command } from "../structures/Command";
import { sqlError } from "../utils/embeds";

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
    options: [
        {
            name: 'liste',
            description: "Affiche la liste des avertissements d'une personne",
            type: ApplicationCommandOptionType.Subcommand,
            options: [ userOption ]
        },
        {
            name: 'ajouter',
            description: "Ajoute un avertissement à un utilisateur",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                userOption,
                {
                    name: 'raison',
                    description: "Raison de l'avertissement",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'preuve',
                    description: "Preuve en image de l'avertissement",
                    required: false,
                    type: ApplicationCommandOptionType.Attachment
                }
            ]
        },
        {
            name: 'supprimer',
            description: "Supprime un avertissement à un utilisateur",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                userOption,
                {
                    name: 'identifiant',
                    description: "Identifiant de l'avertissement à supprimer",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    minValue: 0
                }
            ]
        },
        {
            name: 'réinitialiser',
            description: "Réinitialise les avertissements d'un utilisateur, ou du serveur",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'utilisateur',
                    description: "Utilisateur dont vous voulez réinitialiser les avertissements",
                    required: false,
                    type: ApplicationCommandOptionType.User
                }
            ]
        }
    ],
    run: async({ interaction, args }) => {
        const subcommand = args.getSubcommand();
        await interaction.deferReply();

        Bender.db.query(`SELECT * FROM warns WHERE guild_id="${interaction.guild.id}"`, (err, req) => {
            if (err) {
                console.log(err);
                interaction.editReply({ embeds: [ sqlError(interaction.user) ] }).catch(() => {});
                return;
            };

            if (subcommand === 'liste') {
                
            }
        })
    }
});