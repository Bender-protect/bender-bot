import { ApplicationCommandOption, ChatInputApplicationCommandData, CommandInteraction, CommandInteractionOptionResolver, GuildMember } from "discord.js"
import { BenderClient } from "../structures/Bender";

export class BenderInteraction extends CommandInteraction {
    member: GuildMember = this.member;
    client: BenderClient = this.client;
}
export type commandRunOptions = {
    interaction: BenderInteraction,
    args: CommandInteractionOptionResolver,
    client: BenderClient
};
export type commandOptions = {
    name: string,
    description: string,
    run: (options: commandRunOptions) => any
    dm?:boolean;
    options?: ApplicationCommandOption[],
    whitelist?: boolean,
    ownerOnly?: boolean;
} & ChatInputApplicationCommandData;