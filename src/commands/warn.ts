import { ActionRowBuilder, ApplicationCommandOption, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, InteractionReplyOptions } from "discord.js";
import { Bender } from "../bender";
import { Command } from "../structures/Command";
import { warn, warns } from "../typings/warns";
import { classic, sqlError } from "../utils/embeds";
import { pagination } from "../utils/functions";

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
            name: 'identifier',
            description: "Identifie un avertissement d'un utilisateur",
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

        Bender.db.query(`SELECT * FROM warns WHERE guild_id="${interaction.guild.id}"`, (err, req: warn[]) => {
            if (err) {
                console.log(err);
                interaction.editReply({ embeds: [ sqlError(interaction.user) ] }).catch(() => {});
                return;
            };

            if (subcommand === 'liste') {
                const generateField = (item: warn, embed: EmbedBuilder) => {
                    embed.addFields(
                        {
                            name: 'Avertissement',
                            value: `Par <@${item.mod_id}> ( \`${item.mod_id}\` ) <t:${(item.date / 1000).toFixed(0)}:F>\n> ${item.reason}\nIdentifiant : \`${item.id}\``,
                            inline: false
                        }
                    );
                };

                const user = args.getUser('utilisateur', true);
                const userData = req.filter(x => x.user_id === user.id);

                if (userData.length <= 6) {
                    const embed = classic(interaction.user)
                        .setTitle("Avertissements")
                        .setDescription(`Voici la liste des avertissements de <@${user.id}>`)
                        .setColor(interaction.guild.members.me.displayHexColor)
                    for (const warn of userData) {
                        generateField(warn, embed);
                    };

                    interaction.editReply({ embeds: [ embed ] }).catch(() => {});
                } else {
                    const ebd = () => classic(interaction.user)
                        .setTitle("Avertissements")
                        .setDescription(`Voici la liste des avertissements de <@${user.id}>`)
                        .setColor(interaction.guild.members.me.displayHexColor);
                    
                    const embeds = [ ebd() ];
                    let i = 0;
                    userData.forEach((item: warn) => {
                        let embed = embeds[i];
                        if (embed.data.fields.length % 6 === 0) {
                            embeds.push(ebd());
                            i++;

                            embed = embeds[i];
                        };

                        generateField(item, embed);
                    });

                    pagination({ paginatorName: `Avertissements`, interaction, embeds, user: interaction.user });
                };
            };
            if (subcommand === 'identifier') {
                const user = args.getUser('utilisateur', true);
                const id = args.get('indentifiant', true).value;

                const warn = req.find(x => x.id === id && x.user_id === user.id);
                if (!warn) return interaction.editReply({ embeds: [ classic(interaction.user)
                    .setTitle("❌ Avertissement inexistant")
                    .setDescription(`<@${user.id}> n'a pas d'avertissement avec l'identifiant \`${id}\``)
                    .setColor('#ff0000')
                ] }).catch(() => {});

                const embed = classic(interaction.user)
                    .setTitle('ℹ️ Avertissement')
                    .setColor('#ff0000')
                    .setDescription(`Voici l'avertissement \`${id}\` de <@${user.id}>`)
                    .setFields(
                        {
                            name: 'Modérateur',
                            value: `<@${warn.mod_id}> ( \`${warn.mod_id}\` )`,
                            inline: true
                        },
                        {
                            name: 'Date',
                            value: `<t:${(warn.date / 1000).toFixed(0)}:F>`,
                            inline: true
                        },
                        {
                            name: 'Raison',
                            value: warn.reason,
                            inline: false
                        }
                    )
                
                const replyData: InteractionReplyOptions = {};
                if (warn.proof.length > 1) {
                    embed.setImage(warn.proof);
                    replyData.embeds = [ embed ];

                    replyData.components = [ new ActionRowBuilder({ type: ComponentType.Button, components: [ new ButtonBuilder({ label: 'Télécharger la preuve', customId: "proof-download", style: ButtonStyle.Secondary }) ] }) as ActionRowBuilder<ButtonBuilder> ];
                };

                interaction.editReply(replyData).catch(() => {});
            };
            if (subcommand === 'ajouter') {
                 
            }
        });
    }
});