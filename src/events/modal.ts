import { Event } from "../structures/Event";
import { classic } from "../utils/embeds";
import ms from 'ms';
import { Bender } from "../bender";
import { sanction, sanctionNames, sanctions } from "../typings/sanctions";
import { calcTime } from "../utils/functions";

export default new Event('interactionCreate', (interaction) => {
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'sanction-modal') {
            const time = ms(interaction.fields.getTextInputValue('sanction-select-time'));
            if (!time) {
                interaction.message.edit({ embeds: [ classic(interaction.user)
                    .setTitle('❌ Durée invalide')
                    .setDescription(`La durée que vous avez entré est invalide.\nMerci d'utiliser correctement les valeurs ( un nombre suivit de \`s\`, \`m\`, \`h\`, \`d\` ou \`w\` )`)
                    .setFields(
                        {
                            name: 'Valeurs',
                            value: `> \`s\` : secondes\n> \`m\` : minutes\n> \`h\` : heures\n> \`d\` : jours\n> \`w\` : semaines`,
                            inline: false
                        }
                    )
                    .setColor('#ff0000')
                ] }).catch(() => {});
            };

            const id = interaction.message.components[0].components[0].customId;
            const param = interaction.message.components[0].components[1].customId;

            Bender.sanctionsManager.set(interaction.guild.id, param as keyof sanctions, ({ type: id, time: (time / 1000).toFixed(0) } as sanction));
            interaction.deferUpdate().catch(console.log);

            interaction.message.edit({ components: [], embeds: [ classic(interaction.user)
                .setTitle("Paramètre configuré")
                .setDescription(`Le paramètre \`${sanctionNames.find(x => x.value === param).name}\` a été configuré`)
                .setFields(
                    {
                        name: 'Sanction',
                        value: sanctionNames.find(x => x.value === param).name,
                        inline: true
                    },
                    {
                        name: 'Temps',
                        value: calcTime(Math.floor(time / 1000)),
                        inline: true
                    }
                )
                .setColor('#00ff00') ] })
            .catch(() => {});
        }
    }
})