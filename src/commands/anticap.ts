import { ApplicationCommandOptionType } from "discord.js";
import { Bender } from "../bender";
import { Command } from "../structures/Command";
import { anticapConfig, anticapDisabled, classic, sqlError } from "../utils/embeds";

export default new Command({
    name: 'anticap',
    description: "Gère l'anti-majuscules",
    whitelist: true,
    dm: false,
    options: [
        {
            name: 'configurations',
            description: "Affiche les configurations de l'anticap",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'configurer',
            description: 'Configurer le pourcentage de majuscules autorisé',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'pourcentage',
                    description: "Pourcentage de majuscules autorisés",
                    type: ApplicationCommandOptionType.Number,
                    minValue: 0,
                    maxValue: 100,
                    required: true
                }
            ]
        }
    ],
    run: async({ interaction, args }) => {
        if (!Bender.configsManager.state(interaction.guild.id, 'anticap')) return interaction.reply({ embeds: [ anticapDisabled(interaction.user) ] }).catch(() => {});

        const subcommand = args.getSubcommand();

        await interaction.deferReply();
        if (subcommand === 'configurations') {
            Bender.db.query(`SELECT rate FROM anticap WHERE guild_id="${interaction.guild.id}"`, (err, req) => {
                if (err) {
                    console.log(err);
                    interaction.editReply({ embeds: [ sqlError(interaction.user) ] }).catch(() => {});
                    return;
                };

                let rate = req[0] ?? { rate: '25', default: true };
                interaction.editReply({ embeds: [ anticapConfig(interaction.user, (rate.rate as number)) ] }).catch(() => {});

                if (rate?.default) {
                    Bender.db.query(`INSERT INTO anticap (guild_id) VALUES ("${interaction.guild.id}")`, (e) => {
                        if (e) return console.log(e);
                    });
                };
            });
        };
        if (subcommand === 'configurer') {
            Bender.db.query(`SELECT rate FROM anticap WHERE guild_id="${interaction.guild.id}"`, (err, req) => {
                if (err) {
                    console.log(err);
                    interaction.editReply({ embeds: [ sqlError(interaction.user) ] }).catch(() => {});
                    return;
                };

                const rate = args.getNumber('pourcentage', true);
                let sql = `INSERT INTO anticap (guild_id, rate) VALUES ('${interaction.guild.id}', '${rate}')`;
                if (req.length === 0) sql = `UPDATE anticap SET rate='${rate}' WHERE guild_id='${interaction.guild.id}'`;

                Bender.db.query(sql, (e) => {
                    if (e) {
                        console.log(e);
                        interaction.editReply({ embeds: [ sqlError(interaction.user) ] }).catch(() => {});
                        return;
                    };

                    interaction.editReply({ embeds: [ anticapConfig(interaction.user, rate) ] }).catch(() => {});
                });
            });
        };
    }
});