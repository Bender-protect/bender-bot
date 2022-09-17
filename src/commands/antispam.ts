import { ApplicationCommandOptionType } from "discord.js";
import { Bender } from "../bender";
import { Command } from "../structures/Command";
import { antispam } from '../typings/antispam';
import { antispamConfigs, antispamDisabled, classic } from "../utils/embeds";

export default new Command({
    name: 'antispam',
    description: "Gère l'antispam de votre serveur",
    whitelist: true,
    dm: false,
    options: [
        {
            name: 'configurations',
            description: "Affiche les configurations de l'antispam",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'configurer',
            description: "Configurer un paramètre de l'antispam",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'paramètre',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    description: "Paramètre de l'antispam à configurer",
                    choices: [
                        {
                            name: 'Temps',
                            value: 'time'
                        },
                        {
                            name: 'Messages',
                            value: 'count'
                        }
                    ]
                },
                {
                    name: 'valeur',
                    description: "Valeur du paramètre",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    minValue: 1,
                    maxValue: 10
                }        
            ]
        }
    ],
    run: ({ interaction, args }) => {
        const subcommand = args.getSubcommand(true);

        if (!Bender.configsManager.state(interaction.guild.id, 'antispam')) return interaction.reply({ embeds: [ antispamDisabled(interaction.user) ] }).catch(() => {});
        if (subcommand === 'configurer') {
            const param = args.getString('paramètre', true) as Exclude<keyof antispam, 'guild_id'>;
            const value = args.get('valeur', true).value as unknown as number;

            Bender.antispamDataManager.set(interaction.guild.id, param, value);
            interaction.reply({ embeds: [ classic(interaction.user)
                .setTitle("✅ Paramètre configuré")
                .setDescription(`Le paramètre \`${param === 'count' ? 'Messages':'Temps'}\` a été mis sur **${value} ${param === 'count' ? 'messages':'secondes'}**`)
                .setColor('#00ff00')
            ] }).catch(() => {});
        } else if (subcommand === 'configurations') {
            const configs = Bender.antispamDataManager.get(interaction.guild.id);

            interaction.reply({ embeds: [ antispamConfigs(interaction.user, configs) ] }).catch(() => {});
        };
    }
});