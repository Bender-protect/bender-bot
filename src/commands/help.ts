import { Command } from "../structures/Command";
import { classic } from "../utils/embeds";

export default new Command({
    name: 'help',
    whitelist: false,
    dm: true,
    description: "Affiche la page d'aide",
    run: ({ interaction }) => {
        const embed = classic(interaction.user)
            .setTitle("Page d'aide")
            .setDescription(`Je suis un bot anti-raid qui protège votre serveur contre toute tentative de modification.\nVoici ma liste de commandes :\n${interaction.client.commands.map(x => `\`/${x.name}\` : ${x.description}`).join('\n')}`)
            .setColor('Orange')
            .setAuthor({ name: 'Draver industries', iconURL: 'attachment://logo.png' })
        
        interaction.reply({ embeds: [ embed ], files: [ './logo.png' ] }).catch(() => {});
    }
})