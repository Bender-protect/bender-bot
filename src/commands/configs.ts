import { Command } from "../structures/Command";
import { configs, configTypes } from "../typings/configs";
import { classic, noConfigured } from "../utils/embeds";

export default new Command({
    name: 'configs',
    description: "Affiche les configuration faites sur le serveur",
    ownerOnly: false,
    whitelist: true,
    dm: false,
    run: ({ interaction }) => {
        if (!interaction.client.configsManager.has(interaction.guild.id)) return interaction.editReply({ embeds: [ noConfigured(interaction.user) ] }).catch(() => {});

        const confs = interaction.client.configsManager.get(interaction.guild.id);
        const embed = classic(interaction.user)
            .setTitle("ℹ️ Configuration")
            .setDescription(`Voici la liste des configurations faites sur ${interaction.guild.name}`)
            .setColor(interaction.guild.members.me.displayHexColor);
        
        (Object.keys(confs) as (keyof configs)[]).filter(x => x !== 'guild_id').forEach((config, index) => {
            const c = configTypes.filter(x => x.value === config);
            embed.addFields(
                {
                    name: c[0].name,
                    value: confs[config] ? '✅' : '❌',
                    inline: true
                }
            );

            if (index % 3 === 0 && index !== 0) {
                embed.addFields({
                    name: '\u200b',
                    value: '\u200b',
                    inline: false
                });
            };
        });

        interaction.editReply({ embeds: [ embed ] }).catch(() => {});
    }
})