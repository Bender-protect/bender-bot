import { ApplicationCommandOptionType } from "discord.js";
import { Bender } from "../bender";
import { Command } from "../structures/Command";
import { classic } from "../utils/embeds";

export default new Command({
    name: 'whitelist',
    description: "Gère la whitelist du serveur",
    dm: false,
    ownerOnly: true,
    options: [
        {
            name: 'liste',
            description: "Affiche la whitelist",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'ajouter',
            description: "Ajoute un utilisateur à la whitelist",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'utilisateur',
                    description: "Utilisateur à ajouter",
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: 'retirer',
            description: "Retire un utilisateur de la whitelist",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'utilisateur',
                    description: "Utilisateur à retirer",
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        }
    ],
    run: ({ interaction, args }) => {
        const subcommand = args.getSubcommand();

        if (subcommand === 'liste') {
            const list = Bender.whitelistManager.list(interaction.guild.id);

            if (list.length === 0) return interaction.reply({ embeds: [ classic(interaction.user)
                .setTitle("Whiteliste vide")
                .setDescription(`Il n'y a personne dans la whitelist`)
                .setColor('#ff0000')
            ] }).catch(() => {});

            interaction.reply({ embeds: [ classic(interaction.user)
                .setTitle("Whitelist")
                .setDescription(`Voici la whiteliste du serveur :\n${list.map(x => `<@${x}>`).join(' ')}`)
                .setColor(interaction.guild.members.me.displayHexColor)
            ] }).catch(() => {});
        };
        if (subcommand === 'ajouter') {
            const user = args.getUser('utilisateur',  true);
            if (Bender.whitelistManager.isWhitelisted(interaction.guild, user.id)) return interaction.reply({ embeds: [ classic(interaction.user)
                .setTitle("Déjà ajouté")
                .setDescription(`<@${user.id}> est déjà ajouté à la whiteliste`)
                .setColor('#ff0000')
            ] }).catch(() => {});

            Bender.whitelistManager.set(interaction.guild.id, user.id);
            interaction.reply({ embeds: [ classic(interaction.user)
                .setTitle("Ajouté")
                .setDescription(`<@${user.id}> a été ajouté à la whiteliste`)
                .setColor('#ff0000')
            ] }).catch(() => {});
        };
        if (subcommand === 'retirer') {
            const user = args.getUser('utilisateur', true);
            if (!Bender.whitelistManager.isWhitelisted(interaction.guild, user.id) || interaction.user.id === interaction.guild.ownerId) return interaction.reply({ embeds: [ classic(interaction.user)
                .setTitle("Non-whitelisté")
                .setDescription(`<@${user.id}> n'est pas whitelisté, ou est le propriétaire du serveur.`)
                .setColor('#ff0000')
            ] }).catch(() => {});

            Bender.whitelistManager.remove(interaction.guild.id, user.id);
            interaction.reply({ embeds: [ classic(interaction.user)
                .setTitle("Retiré")
                .setDescription(`<@${user.id}> a été retiré de la whiteliste`)
                .setColor('#ff0000')
            ] }).catch(() => {});
        }
    }
})