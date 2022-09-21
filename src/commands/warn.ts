import { ActionRowBuilder, ApplicationCommandOption, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, GuildMember, InteractionReplyOptions, Message } from "discord.js";
import { Bender } from "../bender";
import { Command } from "../structures/Command";
import { warn, warns } from "../typings/warns";
import { noBtn, proofDownload, yesBtn } from "../utils/components";
import { cancel, classic, deleteWarn, deleteWarnConfirm, invalidProofType, reasonTooLong, resetWarnConfirm, sqlError, unexistingWarn, warnReset } from "../utils/embeds";
import { addLog, addWarn, checkPerms, pagination } from "../utils/functions";
import { waitForInteraction } from "../utils/waitFor";

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

        Bender.db.query(`SELECT * FROM warns WHERE guild_id="${interaction.guild.id}"`, async(err, req: warn[]) => {
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
                if (userData.length === 0) return interaction.editReply({ embeds: [ classic(interaction.user)
                    .setTitle('❌ Pas d\'avertissements')
                    .setDescription(`Il n'y a aucun avertissements sur ${interaction.guild.name}`)
                    .setColor('#ff0000')
                ] }).catch(() => {});

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
                const id = args.get('identifiant', true).value as number;

                const warn = req.find(x => x.id === id && x.user_id === user.id);
                if (!warn) return interaction.editReply({ embeds: [ unexistingWarn({ user: interaction.user, u: user, id })] }).catch(console.log);

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

                    replyData.components = [
                        new ActionRowBuilder().setComponents(proofDownload) as ActionRowBuilder<ButtonBuilder> ];
                };

                interaction.editReply(replyData).catch(() => {});
            };
            if (subcommand === 'ajouter') {
                const user = args.getMember('utilisateur') as GuildMember;
                const reason = args.getString('raison', true);
                const proof = args.getAttachment('preuve', false);

                if (!checkPerms({ member: user, mod: interaction.member, interaction, checkBot: true, checkOwner: true, checkUserPosition: true, checkSelf: true })) return;
                if (proof && !proof.contentType.includes('image')) return interaction.editReply({ embeds: [ invalidProofType(interaction.user) ] }).catch(() => {});

                if (reason.length > 300) return interaction.editReply({ embeds: [ reasonTooLong(interaction.user) ] }).catch(() => {});

                const warn = { user_id: user.id, mod_id: interaction.user.id, guild_id: interaction.guild.id, reason, proof: ((proof && proof?.url) ? proof.url : ''), date: Date.now() };
                addWarn(warn);
                addLog(Object.assign(warn, { type: 'Avertissement' }));

                const emb = classic(interaction.user)
                .setTitle('👮 Avertissement')
                .setDescription(`<@${user.id}> a reçu un avertissement de <@${interaction.user.id}>`)
                .setFields(
                    {
                        name: 'Raison',
                        value: reason,
                        inline: false
                    }
                )
                .setColor('#ff0000');

                if (proof) emb.setImage(proof.url);
                interaction.editReply({ embeds: [ emb ] }).catch(console.log);
            };
            if (subcommand === 'réinitialiser') {
                const user = args.getUser('utilisateur');

                await interaction.editReply({ embeds: [ resetWarnConfirm(interaction.user, user) ], components: [ new ActionRowBuilder({ components: [ yesBtn, noBtn ] }) as ActionRowBuilder<ButtonBuilder> ] }).catch(() => {});
                const msg = await interaction.fetchReply() as Message<true>;

                const choice = await waitForInteraction({
                    message: msg,
                    user: interaction.user,
                    component_type: ComponentType.Button
                });

                if (!choice || choice.customId === 'no') return interaction.editReply({ components: [], embeds: [ cancel() ] }).catch(() => {});
                await interaction.editReply({ embeds: [ warnReset(interaction.user, user) ], components: [] }).catch(() => {});

                interaction.client.db.query(`DELETE FROM warns WHERE guild_id="${interaction.guild.id}"${user ? ` AND user_id="${user.id}"`:''}`, (er, re) => {
                    if (er) {
                        console.log(er);
                        interaction.editReply({ embeds: [ sqlError(interaction.user) ] }).catch(() => {});
                        return;
                    };
                    addLog({
                        date: Date.now(),
                        type: "Réinitialisation d'avertissements",
                        reason: `Réinitialisation des avertissements ${user ? `de ${user.id} (${user.tag})` : 'du serveur'}`,
                        user_id: user?.id ?? interaction.guild.id,
                        guild_id: interaction.guild.id,
                        mod_id: interaction.user.id,
                        proof: ''
                    });
                });
            };
            if (subcommand === 'supprimer') {
                const user = args.getUser('utilisateur', true);
                const id = args.get('identifiant', true).value as number;

                const warn = req.find(x => x.user_id === user.id && x.id === id);
                if (!warn) return interaction.editReply({ embeds: [ unexistingWarn({ user: interaction.user, u: user, id }) ] }).catch(() => {});

                await interaction.editReply({ embeds: [ deleteWarnConfirm({ user: interaction.user, u: user, reason: warn.reason, image: warn.proof.length > 2 ? warn.proof : undefined }) ], components: [ new ActionRowBuilder({ components: [
                    yesBtn,
                    noBtn
                ] }) as ActionRowBuilder<ButtonBuilder> ] }).catch(() => {});
                const msg = await interaction.fetchReply() as Message<true>;

                const choice = await waitForInteraction({
                    message: msg,
                    component_type: ComponentType.Button,
                    user: interaction.user
                });
                if (!choice || choice.customId === 'no') return interaction.editReply({ embeds: [ cancel() ], components: [] }).catch(() => {});
                await interaction.editReply({ embeds: [ deleteWarn({ user: interaction.user, u: user, id }) ] }).catch(() => {});

                Bender.db.query(`DELETE FROM warns WHERE guild_id="${interaction.guild.id}" AND user_id="${user.id}"`, (er) => {
                    if (er) {
                        console.log(er);
                        interaction.editReply({ embeds: [ sqlError(interaction.user) ] }).catch(() => {});
                        return;
                    };

                    addLog({
                        date: Date.now(),
                        type: "Suppression d'avertissement",
                        user_id: user.id,
                        mod_id: interaction.user.id,
                        guild_id: interaction.guild.id,
                        reason: `Suppression (auto-raison)`,
                        proof: warn.proof
                    });
                });
            };
        });
    }
});