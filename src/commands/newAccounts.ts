import { ApplicationCommandOptionType } from "discord.js";
import { Bender } from "../bender";
import { Command } from "../structures/Command";
import { classic, invalidTime, sqlError } from "../utils/embeds";
import ms from 'ms'
import { calcTime } from "../utils/functions";

export default new Command({
    name: 'comptes',
    description: "Gère les comptes trop jeunes",
    whitelist: true,
    dm: false,
    options: [
        {
            name: 'configurer',
            description: "Configure le temps de l'anti nouveaux comptes",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'temps',
                    description: "Temps de l'anti nouveaux comptes",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'configurations',
            description: "Affiche les configurations",
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    run: async({ interaction, args }) => {
        const subcommand = args.getSubcommand();

        if (!Bender.configsManager.state(interaction.guild.id, 'newAccounts')) return interaction.reply({ embeds: [ classic(interaction.user)
            .setTitle('❌ Paramètre désactivé')
            .setDescription(`L'anti nouveaux comptes est désactivé sur ce serveur`)
            .setColor('#ff0000')
        ] }).catch(() => {});

        if (subcommand === 'configurer') {
            const time = ms(args.getString('temps'));
            if (!time) return interaction.reply({ embeds: [ invalidTime(interaction.user) ] }).catch(() => {});

            await interaction.deferReply();
            Bender.db.query(`SELECT guild_id FROM newAccounts WHERE guild_id='${interaction.guild.id}'`, (err, req) => {
                if (err) {
                    console.log(err);
                    interaction.editReply({ embeds: [ sqlError(interaction.user) ] }).catch(() => {});
                    return;
                };
                let sql = `INSERT INTO newAccounts (guild_id, value) VALUES ('${interaction.guild.id}', '${(time / 1000).toFixed(0)}')`;
                if (req.length > 0) sql = `UPDATE newAccounts SET value='${(time / 1000).toFixed(0)} WHERE guild_id='${interaction.guild.id}'`;

                Bender.db.query(sql, (e) => {
                    if (e) {
                        console.log(e);
                        interaction.editReply({ embeds: [ sqlError(interaction.user) ] }).catch(() => {});
                        return;
                    };
                    interaction.editReply({ embeds: [ classic(interaction.user)
                        .setTitle('✅ Paramètre modifié')
                        .setDescription(`La valeur de l'anti nouveaux comptes a été modifié`)
                        .setColor('#00ff00')
                    ] }).catch(() => {});
                });
            });
        };
        if (subcommand === 'configurations') {
            await interaction.deferReply();
            Bender.db.query(`SELECT value FROM newAccounts WHERE guild_id='${interaction.guild.id}'`, async(err, req) => {
                if (err) {
                    console.log(err);
                    interaction.editReply({ embeds: [ sqlError(interaction.user) ] }).catch(() => {});
                    return;
                };
                const getValue = async() => {
                    return new Promise<string | number>((resolve, reject) => {
                        if (req.length === 0) {
                            Bender.db.query(`INSERT INTO newAccounts (guild_id) VALUES ('${interaction.guild.id}')`, (e => {
                                if (e) {
                                    console.log(e);
                                    reject(e);
                                    return;
                                };
                                Bender.db.query(`SELECT value FROM newAccounts WHERE guild_id='${interaction.guild.id}'`, (er, re) => {
                                    if (er) {
                                        console.log(er);
                                        reject(er);
                                        return;
                                    };
                                    resolve(re[0]?.value)
                                });
                            }));
                        } else {
                            resolve(req[0]?.value);
                        }
                    })
                };

                const value = await getValue();
                if (typeof value === 'string') {
                    interaction.editReply({ embeds: [ sqlError(interaction.user) ] });
                } else {
                    interaction.editReply({ embeds: [ classic(interaction.user)
                        .setTitle('ℹ️ ANti nouveaux comptes')
                        .setDescription(`Le temps de l'anti nouveaux comptes est définit sur **${calcTime(value)}**`)
                        .setColor('#00ff00')
                    ] }).catch(() => {});
                };
            });
        };
    }
});