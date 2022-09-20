import { ButtonBuilder, ButtonStyle, Embed, GuildMember, User, ActionRowBuilder, Message, EmbedBuilder, SelectMenuBuilder, ComponentType } from "discord.js";
import { Bender } from "../bender";
import { BenderInteraction } from "../typings/commandType";
import { tempban } from "../typings/tempbans";
import { warn } from "../typings/warns";
import { waitForInteraction } from "./waitFor";
import { cancel, interactionNotAllowed, paginationSelect, paginatorClosed, perms } from "./embeds";

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
export const pagination = async({ paginatorName, interaction, user, ...opts }: { embeds: EmbedBuilder[], paginatorName: string, user: User, interaction: BenderInteraction }) => {
    const embeds = opts.embeds;
    embeds.forEach((embed, i) => {
        embed.setFooter({ text: embed.data.footer.text + ` | ${i + 1}/${embeds.length}` })
    });

    const reply = async(params) => {
        if (interaction.replied) {
            await interaction.editReply(params).catch(() => {});
        } else {
            await interaction.reply(params).catch(() => {});
        };

        return await interaction.fetchReply() as Message<true>;
    };
    let index = 0;
    const components = (allDisabled?: boolean) => {
        const disabled = allDisabled ?? false;
        const components: ButtonBuilder[] = [
            new ButtonBuilder().setEmoji('⬅️').setCustomId('previous').setStyle(ButtonStyle.Secondary).setDisabled(index === 0),
            new ButtonBuilder().setEmoji('🔢').setCustomId('select').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setEmoji('➡️').setCustomId('next').setStyle(ButtonStyle.Secondary).setDisabled(index === embeds.length - 1),
            new ButtonBuilder().setEmoji('❌').setCustomId('close').setStyle(ButtonStyle.Danger)
        ];

        if (disabled) components.map(x => x.setDisabled(disabled));
        return new ActionRowBuilder({ components }) as ActionRowBuilder<ButtonBuilder>;
    };

    const msg = await reply({ embeds: [ embeds[index] ], components: [ components() ] });
    const collector = msg.createMessageComponentCollector({ time: 300000, idle: 120000 });

    collector.on('collect', async({ customId, deleteReply, deferUpdate, reply, ...i }) => {
        if (i.user.id !== user.id) {
            reply({ embeds: [ interactionNotAllowed(i.user) ], ephemeral: true }).catch(() => {});
            return;
        };

        let embed: EmbedBuilder;
        if (customId === 'next') {
            index++
            embed = embed[index]
        };
        if (customId === 'previous') {
            index--;
            embed = embed[index];
        };
        if (customId === 'close') {
            i.message.edit({ components: [], embeds: [ paginatorClosed(user, paginatorName) ] }).catch(() => {});
            return;
        };
        if (customId === 'select') {
            if (embeds.length < 25) {
                const selector = new SelectMenuBuilder()
                    .setCustomId('select-menu-paginator')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .setOptions(embeds.map((v, i) => ({ label: `${i + 1}${i + 1 === 1 ? 'er' : 'e'}`, value: i.toString(), description: `Page ${i + 1}`, default: i === 0 })))
                const row = new ActionRowBuilder({ components: [ selector ] }) as ActionRowBuilder<SelectMenuBuilder>;

                const iReply = await reply({ fetchReply: true, components: [ row ], embeds: [ paginationSelect(user) ], ephemeral: true }).catch(() => {}) as Message<true>;
                const choice = await waitForInteraction({ component_type: ComponentType.SelectMenu, message: iReply, user }).catch(() => {});

                deleteReply().catch(() => {});
                if (!choice) return;

                embed = embeds[parseInt(choice.values[0])];
            } else {
                let rows = [new SelectMenuBuilder()] as unknown;

                let rowIndex = 0;
                for (let i = 0; i < embeds.length; i++) {
                    const row = rows[rowIndex];
                    row.addOptions(
                        {
                            label: `Page ${i}`,
                            value: i.toString(),
                            description: `Aller à la page ${i}`
                        }
                    );

                    if (row.options.length === 24) {
                        rowIndex++;
                        (rows as SelectMenuBuilder[]).push(new SelectMenuBuilder());
                    };
                };

                rows = (rows as []).map((builder: SelectMenuBuilder) => new ActionRowBuilder({ components: [ builder ] }) as ActionRowBuilder<SelectMenuBuilder>);

                const iReply = await reply({ fetchReply: true, ephemeral: true, embeds: [ paginationSelect(user) ], components: (rows as ActionRowBuilder<SelectMenuBuilder>[]) }).catch(() => {}) as Message<true>;
                const choice = await waitForInteraction({ component_type: ComponentType.SelectMenu, message: iReply, user }).catch(() => {});

                deleteReply().catch(() => {});
                if (!choice) return;

                index = parseInt(choice.values[0]);
                embed = embeds[parseInt(choice.values[0])];
            };
        };

       deferUpdate().catch(() => {});
       i.message.edit({ embeds: [ embed ], components: [ components() ] }).catch(() => {});
    });

    collector.on('end', () => {
        msg.edit({ components: [ components(true) ] }).catch(() => {});
    });
};