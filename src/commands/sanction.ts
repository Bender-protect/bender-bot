import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ComponentType, Message, ModalBuilder, SelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { Bender } from "../bender";
import { Command } from "../structures/Command";
import { sanction, sanctionNames, sanctions, sanctionsValues, sanctionCorres } from "../typings/sanctions";
import { cancelButton, sanctionSelector } from "../utils/components";
import { cancel, classic, sanctionConfigs } from "../utils/embeds";

export default new Command({
    name: 'sanction',
    description: "Gère les sanctions sur le serveur",
    options: [
        {
            name: 'configurer',
            description: "Configurer une sanction",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'paramètre',
                    description: "Paramètre à configurer",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: sanctionNames
                }
            ]
        },
        {
            name: 'configurations',
            description: "Affiche les configurations des sanctions du serveur",
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    ownerOnly: true,
    run: async({ interaction, args }) => {
        const subcommand = args.getSubcommand();

        if (subcommand === 'configurer') {
            const param = args.getString('paramètre', true) as keyof sanctions;

            const cores = {
                channelCreate: 'channelCreate_enable',
                channelDelete: 'channelDelete_enable',
                channelUpdate: 'channelUpdate_enable',
                roleCreate: 'roleCreate_enable',
                roleDelete: 'roleDelete_enable',
                roleUpdate: 'roleUpdate_enable',
                ban: 'allowBan',
                spam: 'antispam',
                guildUpdate: 'guildUpdate_enable',
                anticap: 'anticap'
            };

            if (!Bender.configsManager.state(interaction.guild.id, cores[param])) return interaction.reply({ embeds: [ classic(interaction.user)
                .setTitle("❌ Paramètre désactivé")
                .setDescription(`Le paramètre correspondant à cette sanction a été désactivé sur le serveur.\nRéactivez le avec la commande \`/set\` pour configurer la sanction`)
                .setColor('#ff0000')
            ] }).catch(() => {});

            const msg = await interaction.reply({ embeds: [ classic(interaction.user)
                .setTitle("❓ Sanction")
                .setDescription(`Quelle sanction voulez-vous appliquer à ce paramètre ?`)
                .setColor('Grey')
            ], components: [
                new ActionRowBuilder({ components: [ sanctionSelector ]}) as ActionRowBuilder<SelectMenuBuilder>,
                new ActionRowBuilder({ components: [ cancelButton ] }) as ActionRowBuilder<ButtonBuilder>
            ], fetchReply: true }) as Message<true>;

            if (msg) {
                const collector = msg.createMessageComponentCollector({ time: 120000 });
                
                collector.on('collect', (i) => {
                    if (i.user.id !== interaction.user.id) {
                        i.deferUpdate();
                        return;
                    };

                    // Si tu lis ça c'est que t'as des bons yeux
                    if (i.componentType === ComponentType.Button) {
                        interaction.editReply({ embeds: [ cancel() ], components: [] }).catch(() => {});
                    } else if (i.componentType === ComponentType.SelectMenu) {
                        const selectSanction = i.values[0];

                        if (sanctionsValues[selectSanction].length === 2) {
                            const choices = ['10s', '35m', '2h', '2d', '1w'];

                            const modal = new ModalBuilder()
                                .setComponents(
                                    new ActionRowBuilder()
                                        .setComponents(
                                            new TextInputBuilder()
                                                .setCustomId('sanction-select-time')
                                                .setLabel('Temps')
                                                .setStyle(TextInputStyle.Short)
                                                .setRequired(true)
                                                .setPlaceholder(choices[Math.floor(Math.random() * 5)])
                                        ) as ActionRowBuilder<TextInputBuilder>
                                )
                                .setTitle("Temps de la sanction")
                                .setCustomId('sanction-modal')
                                
                            i.showModal(modal).catch(console.log);
                            interaction.editReply({ components: [ new ActionRowBuilder({ components: [
                                new ButtonBuilder().setLabel(sanctionCorres[selectSanction]).setDisabled(true).setCustomId(selectSanction).setStyle(ButtonStyle.Primary),
                                new ButtonBuilder().setLabel(sanctionNames.find(x => x.value === param).name).setDisabled(true).setCustomId(param).setStyle(ButtonStyle.Primary)
                            ] }) as ActionRowBuilder<ButtonBuilder> ] }).catch(() => {});
                        } else {
                            Bender.sanctionsManager.set(interaction.guild.id, param, { type: selectSanction } as sanction);
                            interaction.editReply({ components: [], embeds: [ classic(interaction.user)
                                .setTitle("Paramètre configuré")
                                .setDescription(`Le paramètre \`${sanctionNames.find(x => x.value === param).name}\` a été configuré`)
                                .setFields(
                                    {
                                        name: 'Sanction',
                                        value: sanctionCorres[selectSanction],
                                        inline: false
                                    }
                                )
                                .setColor('#00ff00')
                            ] }).catch(() => {});
                        };
                    }
                });
            }
        };
        if (subcommand === 'configurations') {
            interaction.reply({ embeds: [ sanctionConfigs(interaction.user, Bender.sanctionsManager.getAll(interaction.guild.id)) ] }).catch(() => {});
        }
    }
})