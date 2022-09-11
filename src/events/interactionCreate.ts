import { ApplicationCommandDataResolvable, CommandInteractionOptionResolver } from "discord.js";
import { Event } from "../structures/Event";
import { BenderInteraction } from "../typings/commandType";
import { noConfigured, notWhitelisted, sqlError } from "../utils/embeds";

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
        if (cmd.whitelist === true && interaction.guild) {
            await interaction.deferReply();
            interaction.client.db.query(`SELECT users FROM whitelist WHERE guild_id="${interaction.guild.id}"`, (error, request) => {
                if (error) return interaction.editReply({ embeds: [ sqlError(interaction.user) ] }).catch(() => {});

                if (request.length === 0) return interaction.editReply({ embeds: [ noConfigured(interaction.user) ] }).catch(() => {});
                const users = JSON.parse(request[0].users);

                if (!users.includes(interaction.user.id)) return interaction.editReply({ embeds: [ notWhitelisted(interaction.user) ] }).catch(() => {});
                run();
            });
        } else {
            run();
        }
    }
})