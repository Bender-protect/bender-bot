import { Command } from "../structures/Command";

export default new Command({
    name: 'configs',
    description: "Affiche les configuration faites sur le serveur",
    ownerOnly: false,
    whitelist: true,
    run: ({ interaction }) => {
        if (!interaction.client.configsManager.has(interaction.guild.id)) return interaction.reply({  })
    }
})