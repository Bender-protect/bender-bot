import { ActionRowBuilder, APIEmbedField, ApplicationCommandOptionType, ButtonBuilder, EmbedBuilder } from "discord.js";
import { Command } from "../structures/Command";
import { log } from "../typings/log";
import { proofDownload } from "../utils/components";
import { classic, noLogs, sqlError, unexistingLog } from "../utils/embeds";
import { pagination } from "../utils/functions";

export default new Command({
    name: 'logs',
    description: "Affiche les logs de Bender Protect",
    whitelist: true,
    dm: false,
    run: async({ interaction, args }) => {
        await interaction.deferReply();
        
        const subcommand = args.getSubcommand();
        const sql = `SELECT * FROM logs WHERE guild_id="${interaction.guild.id}"${subcommand === 'identifier' ? ` AND id="${args.get('identifiant', true).value}"`:''}`;
        interaction.client.db.query(sql, (err, req: log[]) => {
            if (err) {
                console.log(err);
                interaction.editReply({ embeds: [ sqlError(interaction.user) ] }).catch(() => {});
                return;
            };

            if (subcommand === 'identifier') {
                const l = req[0];
                if (!l) return interaction.editReply({ embeds: [ unexistingLog(interaction.user) ] }).catch(() => {});
                const isGuild = l.user_id === l.guild_id;

                const embed = classic(interaction.user)
                    .setTitle(l.type)
                    .setDescription(`Voici le log \`${l.id}\``)
                    .setColor('#00ff00')
                    .setFields(
                        {
                            name: 'Modérateur',
                            value: `<@${l.mod_id}> ( \`${l.mod_id}\` )`,
                            inline: true
                        },
                        {
                            name: 'Membre',
                            value: isGuild ? 'Serveur' : `<@${l.user_id}> ( \`${l.user_id}\` )`
                        },
                        {
                            name: 'Date',
                            value: `<t:${(l.date / 1000).toFixed(0)}:F>`,
                            inline: true
                        },
                        {
                            name: 'Raison',
                            value: l.reason,
                            inline: false
                        }
                    );
                
                if (l.proof.length > 2) embed.setImage(l.proof);
                const replyData = {
                    embeds: [ embed ],
                    components: []
                };
                if (l.proof.length > 2) {
                    replyData.components.push(new ActionRowBuilder({ components: [ proofDownload ] }) as ActionRowBuilder<ButtonBuilder>);
                };

                interaction.editReply(replyData).catch(() => {});
            };
            if (subcommand === 'liste') {
                if (req.length === 0) return interaction.editReply({ embeds: [ noLogs(interaction.user) ] }).catch(() => {});

                const generateField = (embed: EmbedBuilder, { type, mod_id, id, date }: log) => {
                    embed.addFields(
                        {
                            name: type,
                            value: `Par <@${mod_id}> ( \`${mod_id}\` ) <t:${(date / 1000).toFixed(0)}:F>\n> Identifiant : \`${id}\``,
                            inline: false
                        }
                    );
                };

                const base = () => {
                    const x = classic(interaction.user)
                        .setTitle("📚 Logs du serveur")
                        .setDescription(`Voici les logs du serveur ( ${req.length} log(s) )`)
                        .setColor(interaction.guild.members.me.displayHexColor)
                    return x;
                }
                if (req.length <= 6) {
                    const embed = base();
                    req.forEach((r) => generateField(embed, r));

                    interaction.editReply({ embeds: [ embed ] }).catch(() => {});
                } else {
                    const embeds = [ base() ];

                    let i = 0;
                    req.forEach((item) => {
                        let embed = embeds[i];
                        if (embed.data.fields?.length % 6 === 0) {
                            embeds.push(base());
                            i++;

                            embed = embeds[i];
                        };

                        generateField(embed, item);
                    });

                    pagination({ paginatorName: 'Logs du serveur', interaction, user: interaction.user, embeds });
                }
            };
        });
    },
    options: [
        {
            name: 'liste',
            description: "Affiche la liste des logs",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'identifier',
            description: "Identifie un log du serveur",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'identifiant',
                    description: "Identifiant du log à afficher",
                    required: true,
                    minValue: 1,
                    type: ApplicationCommandOptionType.Integer
                }
            ]
        }
    ]
})