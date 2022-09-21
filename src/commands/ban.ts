import { ComponentType, GuildMember, Message } from "discord.js";
import { Command } from "../structures/Command";
import { yesNoRow } from "../utils/components";
import { banConfirm, cancel, classic, invalidProofType, perms, reasonTooLong, youveBenBanned } from "../utils/embeds";
import { addLog, checkPerms } from "../utils/functions";
import { proofOption, reasonOption, userOption } from "../utils/options";
import { waitForInteraction } from "../utils/waitFor";

export default new Command({
    name: 'ban',
    description: "Banni un utilisateur du serveur",
    options: [
        userOption({ description: "Utilisateur à bannir" }),
        reasonOption,
        proofOption
    ],
    whitelist: true,
    dm: false,
    run: async({ interaction, args }) => {
        const member = args.getMember('utilisateur') as GuildMember;
        const reason = args.getString('raison', true);
        const proof = args.getAttachment('preuve', false);

        if (!checkPerms({ member, interaction, mod: interaction.member, checkUserPosition: true, checkOwner: true, checkSelf: true, checkWhitelist: { ownerExcluded: true }})) return;
        if (!member.bannable) return interaction.reply({ embeds: [ perms.client(interaction.user) ] }).catch(() => {});
        if (!proof.contentType.includes('image')) return interaction.reply({ embeds: [ invalidProofType(interaction.user) ] }).catch(() => {});
        if (reason.length > 300) return interaction.reply({ embeds: [ reasonTooLong(interaction.user) ] }).catch(() => {});

        const msg = await interaction.reply({ embeds: [ banConfirm(interaction.user, member.user) ], components: [ yesNoRow ], fetchReply: true }) as Message<true>;
        
        const decision = await waitForInteraction({
            component_type: ComponentType.Button,
            message: msg,
            user: interaction.user
        });
        if (!decision || decision.customId === 'no') return interaction.editReply({ embeds: [ cancel() ], components: [] }).catch(() => {});
        interaction.editReply({ components: [] }).catch(() => {});
        await member.send({ embeds: [ youveBenBanned({ guildName: interaction.guild.name, user: interaction.user, proof: proof?.url, reason }) ] }).catch(() => {});
        await member.ban({ reason }).catch(() => {});

        const ban = classic(interaction.user)
            .setTitle("👮 Bannissement")
            .setDescription(`${member.user.tag} a été banni du serveur`)
            .setColor('#00ff00')

        if (proof) ban.setImage(proof.url);

        interaction.editReply({ embeds: [ ban ] }).catch(() => {});
        addLog({
            date: Date.now(),
            guild_id: interaction.guild.id,
            mod_id: interaction.user.id,
            user_id: member.id,
            type: 'Bannissement',
            proof: proof?.url ?? '',
            reason
        });
    }
});