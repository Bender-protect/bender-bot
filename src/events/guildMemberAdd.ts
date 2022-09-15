import { Bender } from "../bender";
import { Event } from "../structures/Event";
import { classic } from "../utils/embeds";

export default new Event('guildMemberAdd', async(member) => {
    Bender.configsManager.setup(member.guild.id);
    if (Bender.configsManager.state(member.guild.id, 'raidmode')) {
        await member.send({ embeds: [ classic(member.user)
            .setTitle('Raidmode')
            .setDescription(`Le raid mode a été activé sur ${member.guild.name}, si vous pensez que c'est un bug, revenez sur le serveur car il vient d'être régmé.\nSi ce n'est pas un bug, arrêtez d'essayer de venir, car je vais pas arrêter de vous expulser`)
            .setColor('#ff0000')
        ] }).catch(() => {});

        member.kick('raidmode').catch(() => {});
    };
});