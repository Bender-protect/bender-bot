import { Bender } from "../bender";
import { Command } from "../structures/Command";
import { gbanDisabled, sqlError, gbanned, classic } from "../utils/embeds";

export default new Command({
    name: 'purge',
    description: "Expulse tout les membres GBannis de votre serveur",
    whitelist: true,
    dm: false,
    run: async({ interaction }) => {
        if (!Bender.configsManager.state(interaction.guild.id, 'gban')) return interaction.reply({ embeds: [ gbanDisabled(interaction.user) ] }).catch(() => {});

        await interaction.deferReply();
        Bender.db.query(`SELECT users FROM gban`, async(err, req) => {
            if(err) return interaction.editReply({ embeds: [ sqlError(interaction.user) ] }).catch(() => {});

            const users = JSON.parse(req[0].users);
            await interaction.guild.members.fetch();
            const toKick = interaction.guild.members.cache.filter(x => users.includes(x.id));

            toKick.forEach((member) => {
                member.send({ embeds: [ gbanned(member.user) ] }).catch(() => {}).then(() => {
                    member.kick('gbanned').catch(() => {});
                });
            });

            interaction.editReply({ embeds: [ classic(interaction.user)
                .setTitle('✅ Purge effectué')
                .setDescription(`Les membres GBannis ont commencé à être expulsés`)
                .setColor('#00ff00')
            ] }).catch(() => {});
        });
    }
});