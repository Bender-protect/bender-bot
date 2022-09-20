import { ButtonBuilder, ButtonStyle, Embed, GuildMember, User, ActionRowBuilder } from "discord.js";
import { Bender } from "../bender";
import { BenderInteraction } from "../typings/commandType";
import { tempban } from "../typings/tempbans";
import { warn } from "../typings/warns";
import { perms } from "./embeds";

export const addLog = (options: warn) => {
    Bender.db.query(`INSERT INTO logs (guild_id, mod_id, user_id, date, reason, proof) VALUES ("${options.guild_id}", "${options.mod_id}", "${options.user_id}", "${options.date}", "${options.reason}", "${options.proof ? options.proof : ''}")`, (e) => {
        if (e) return console.log(e);
    });
};
export const addWarn = ({ user_id, mod_id, guild_id, reason, proof, date }: warn) => {
    Bender.db.query(`INSERT INTO warns (guild_id, mod_id, user_id, date, reason, proof) VALUES ("${guild_id}", "${mod_id}", "${user_id}", "${date}", "${reason}", "${proof ? proof : ''}")`, (e) => {
        if (e) return console.log(e);
    });
};
export const tempBan = (options: tempban) => {
    Bender.db.query(`INSERT INTO logs (guild_id, mod_id, user_id, date, date_end, reason, proof) VALUES ("${options.guild_id}", "${options.mod_id}", "${options.user_id}", "${options.date}", "${options.date_end}", "${options.reason}", "${options.proof ? options.proof : ''}")`, (e) => {
        if (e) return console.log(e);
    });
};
export const calcTime = (n: number) => {
    let seconds = n;
    let minutes = 0;
    let hours = 0;
    let days = 0;
    let weeks = 0;

    let count = 0;
    for (let i = 0; i < n; i++) {
        seconds--;
        count++;
        if (count === 60) {
            count = 0;
            minutes++;
            if (minutes === 60) {
                minutes = 0;
                hours++;

                if (hours === 24) {
                    hours = 0;
                    days++;
                    if (days == 7) {
                        weeks++;
                        days = 0;
                    };
                };
            };
        };
    };

    let time = [];
    const prefixes = ['semaines', 'jours', 'heures', 'minutes', 'secondes'];
    [weeks, days, hours, minutes, seconds].forEach((x, i) => {
        if (x) time.push(`${x} ${prefixes[i]}`);
    });

    return time.join(', ');
};

type checkPermsOptions = {
    mod: GuildMember;
    member: GuildMember;
    interaction: BenderInteraction;
    checkSelf?: boolean;
    checkOwner?: boolean;
    checkBot: boolean;
    checkPosition?: boolean;
};

export const checkPerms = ({  member, interaction, mod, ...options }: checkPermsOptions) => {
    const reply = (params) => {
        if (interaction.replied) {
            interaction.editReply(Object.assign(params, { components: [], files: [], attachments: [] })).catch(() => {});
        } else {
            interaction.reply(params).catch(() => {});
        };
    };

    if (!member.moderatable) {
        reply({ embeds: [ perms.client(mod.user) ] });
        return false;
    };
    if (!options.checkPosition === false) {
        const { position } = member.roles.highest;
        if (position >= mod.roles.highest.position && mod.id !== mod.guild.ownerId) {
            reply({ embeds: [perms.memberPosition(mod.user, 'vous') ] });
            return false;
        };
        if (position >= mod.guild.members.me.roles.highest.position) {
            reply({ embeds: [ perms.memberPosition(mod.user, 'vous') ] });
            return false;
        };
    };
    if (options.checkBot === true && member.user.bot) {
        reply({ embeds: [ perms.bot(mod.user) ] });
        return false;
    };
    if (options.checkOwner === true && member.user.id === member.guild.ownerId) {
        reply({ embeds: [ perms.owner(mod.user, member.user) ] });
        return false;
    };
    if (options.checkSelf === true && mod.id === member.id) {
        reply({ embeds: [ perms.selfUser(mod.user) ] });
        return false;
    };
    return true;
};
export const pagination = async({ embeds, paginatorName, interaction, user }: { embeds: Embed[], paginatorName: string, user: User, interaction: BenderInteraction }) => {
    const reply = async(params) => {
        if (interaction.replied) {
            await interaction.editReply(params).catch(() => {});
            return await interaction.fetchReply();
        } else {
            return await interaction.reply(Object.assign(params, { fetchReply: true })).catch(() => {});
        };
    };
    let index = 0;
    const components = () => {
        const components: ButtonBuilder[] = [
            new ButtonBuilder().setEmoji('⬅️').setCustomId('previous').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setEmoji('🔢').setCustomId('select').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setEmoji('➡️').setCustomId('next').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setEmoji('❌').setCustomId('close').setStyle(ButtonStyle.Danger)
        ];

        return new ActionRowBuilder({ components }) as ActionRowBuilder<ButtonBuilder>;
    };

    const msg = await reply({ embeds: [ embeds[index] ], components: [ components() ] });
    
};