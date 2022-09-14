import { CommandInteractionOptionResolver } from "discord.js";
import { Event } from "../structures/Event";
import { BenderInteraction } from "../typings/commandType";
import { noConfigured, notWhitelisted, ownerOnly, sqlError } from "../utils/embeds";

export default new Event('interactionCreate', async(inter) => {
    const interaction = inter as BenderInteraction;
    if (interaction.isCommand()) {
        const cmdName = interaction.commandName;
        const cmd = interaction.client.commands.get(cmdName);

        if (cmd.dm === false && !interaction.guild) return interaction.reply(`Vous ne pouvez exécuter cette commande que sur un serveur`);

        const run = () => {
            cmd.run({
                interaction,
                args: interaction.options as CommandInteractionOptionResolver,
                client: interaction.client
            });
        };
        if (cmd?.ownerOnly === true && interaction.guild && interaction.guild.ownerId !== interaction.user.id) return interaction.reply({ embeds: [ ownerOnly(interaction.user, interaction.guild.ownerId) ] })
        if (cmd?.whitelist === true && interaction.guild) {
            await interaction.deferReply();
            interaction.client.db.query(`SELECT users FROM whitelist WHERE guild_id="${interaction.guild.id}"`, (error, request) => {
                if (error) {
                    console.log(error);
                    return interaction.editReply({ embeds: [ sqlError(interaction.user) ] }).catch(() => {})
                };

                if (interaction.user.id === interaction.guild.ownerId) return run();

                if (request.length === 0) return interaction.editReply({ embeds: [ notWhitelisted(interaction.user) ] }).catch(() => {});
                
                const users = JSON.parse(request[0].users);
                if (!users.includes(interaction.user.id)) return interaction.editReply({ embeds: [ notWhitelisted(interaction.user) ] }).catch(() => {});
                run();
            });
        } else {
            run();
        }
    }
})