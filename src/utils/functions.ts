import { ButtonBuilder, ButtonStyle, GuildMember, User, ActionRowBuilder, Message, EmbedBuilder, SelectMenuBuilder, ComponentType, Collection } from "discord.js";
import { Bender } from "../bender";
import { BenderInteraction } from "../typings/commandType";
import { tempban } from "../typings/tempbans";
import { warn } from "../typings/warns";
import { waitForInteraction } from "./waitFor";
import { cancel, interactionNotAllowed, paginationEmbeds, paginationSelect, paginatorClosed, perms } from "./embeds";
import { log } from "../typings/log";

export const addLog = (options: log) => {
    Bender.db.query(`INSERT INTO logs (guild_id, mod_id, user_id, date, reason, proof, type) VALUES ("${options.guild_id}", "${options.mod_id}", "${options.user_id}", "${options.date}", "${options.reason}", "${options.proof ? options.proof : ''}", "${options.type}")`, (e) => {
        if (e) return console.log(e);
    });
};
export const addWarn = ({ user_id, mod_id, guild_id, reason, proof, date }: warn) => {
    Bender.db.query(`INSERT INTO warns (guild_id, mod_id, user_id, date, reason, proof) VALUES ("${guild_id}", "${mod_id}", "${user_id}", "${date}", "${reason.replace(/"/g, '\"')}", "${proof ? proof : ''}")`, (e) => {
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
    checkBot?: boolean;
    checkBotPosition?: boolean;
    checkUserPosition?: boolean;
    checkWhitelist?: {
        ownerExcluded: boolean
    }
};

export const checkPerms = ({ member, interaction, mod, ...options }: checkPermsOptions) => {
    const reply = (params) => {
        if (interaction.replied || interaction.deferred) {
            interaction.editReply(Object.assign(params, { components: [], files: [], attachments: [] })).catch(() => {});
        } else {
            interaction.reply(params).catch(() => {});
        };
    };

    if (!member.moderatable) {
        reply({ embeds: [ perms.client(mod.user) ] });
        return false;
    };
    const { position } = member.roles.highest;
    if (options.checkBotPosition === true) {
        if (position >= mod.guild.members.me.roles.highest.position) {
            reply({ embeds: [ perms.memberPosition(mod.user, 'moi') ] });
            return false;
        };
    };
    if (options.checkUserPosition === true) {
        if (position >= mod.roles.highest.position && mod.id !== mod.guild.ownerId) {
            reply({ embeds: [perms.memberPosition(mod.user, 'vous') ] });
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
    if (options.checkWhitelist) {
        if (!(options.checkWhitelist.ownerExcluded === true && mod.id === mod.guild.ownerId)) {
            if (Bender.whitelistManager.isWhitelisted(member.guild, member.id, '')) {
                reply({ embeds: [ perms.whiteListed(mod.user) ] });
                return false;
            };
        };
    };
    return true;
};
export const pagination = async({ paginatorName, interaction, user, ...opts }: { embeds: EmbedBuilder[], paginatorName: string, user: User, interaction: BenderInteraction }) => {
    const embeds = opts.embeds;
    embeds.forEach((embed, i) => {
        embed.setFooter({ text: embed.data.footer.text + ` | ${i + 1}/${embeds.length}` })
    });

    const reply = async(params) => {
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply(params).catch(() => {});
        } else {
            await interaction.reply(params).catch(() => {});
        };

        return await interaction.fetchReply() as Message<true>;
    };
    let index = 0;
    const components = ({ allDisabled = false, selectDisabled = false }: { allDisabled?: boolean, selectDisabled?: boolean }) => {
        const disabled = allDisabled;
        const components: ButtonBuilder[] = [
            new ButtonBuilder().setEmoji('⬅️').setCustomId('previous').setStyle(ButtonStyle.Secondary).setDisabled(index === 0),
            new ButtonBuilder().setEmoji('🔢').setCustomId('select').setStyle(ButtonStyle.Primary).setDisabled(selectDisabled),
            new ButtonBuilder().setEmoji('➡️').setCustomId('next').setStyle(ButtonStyle.Secondary).setDisabled(index === embeds.length - 1),
            new ButtonBuilder().setEmoji('❌').setCustomId('close').setStyle(ButtonStyle.Danger)
        ];

        if (disabled) components.map(x => x.setDisabled(disabled));
        return new ActionRowBuilder({ components }) as ActionRowBuilder<ButtonBuilder>;
    };

    const msg = await reply({ embeds: [ embeds[index] ], components: [ components({}) ] });
    const collector = msg.createMessageComponentCollector({ time: 300000, idle: 120000 });

    collector.on('collect', async(i) => {
        if (i.user.id !== user.id) {
            reply({ embeds: [ interactionNotAllowed(i.user) ], ephemeral: true }).catch(() => {});
            return;
        };

        let embed: EmbedBuilder;
        if (i.customId === 'next') {
            index++
            embed = embeds[index]
        };
        if (i.customId === 'previous') {
            index--;
            embed = embeds[index];
        };
        if (i.customId === 'close') {
            i.message.edit({ components: [], embeds: [ paginatorClosed(user, paginatorName) ] }).catch(() => {});
            return;
        };
        if (i.customId === 'select') {
            let trash: Collection<string, Message<boolean>> = new Collection();
            
            i.message.edit({ components: [ components({ selectDisabled: true }) ] })
            i.deferUpdate().catch(() => {});
            const msg = await interaction.channel.send({ embeds: [ paginationEmbeds.askPage(user) ] }).catch(() => {}) as Message<true>
            trash.set(msg.id, msg);
            
            const collector = msg.channel.createMessageCollector({ filter: x => x.author.id === user.id, max: 1, time: 120000 });
            collector.on('end', (collected) => {
                if (collected.size > 0) trash.set(collected.first().id, collected.first());

                interaction.channel.bulkDelete(trash).catch(() => {});
                const { content } = collected.first();

                let embed: EmbedBuilder;
                if (content.toLocaleLowerCase() === 'cancel') embed = cancel();
                else {
                    const input = parseInt(content);
                    if (isNaN(input) || !embeds[input - 1]) embed = paginationEmbeds.invalidPage(user);
                    else {
                        index = input - 1;
                    };
                };

                if (embed) {
                    interaction.channel.send({ embeds: [ embed ] }).then((x) => {
                        setTimeout(() => {
                            x.delete().catch(() => {});
                        }, 6000);
                    }).catch(() => {});
                } else {
                    i.message.edit({ embeds: [ embeds[index] ], components: [ components({}) ] }).catch(() => {});
                };
            });
            return;
        };

       i.deferUpdate();
       i.message.edit({ embeds: [ embed ], components: [ components({}) ] }).catch(() => {});
    });

    collector.on('end', () => {
        msg.edit({ components: [ components({ allDisabled: true }) ] }).catch(() => {});
    });
};