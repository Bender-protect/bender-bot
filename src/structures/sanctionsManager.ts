import { Guild, GuildMember, User } from "discord.js";
import { database } from "../typings/Database";
import { sanction, sanctions } from "../typings/sanctions";
import { classic } from "../utils/embeds";
import { addLog, addWarn, tempBan } from "../utils/functions";
import { BenderClient } from "./Bender";

export class sanctionsManager {
    #client: BenderClient;
    #db: database;
    #cache: Map<string, sanctions> = new Map();

    constructor(client: BenderClient, db: database) {
        this.#client = client;
        this.#db = db;
    }
    public start() {
        this.fillCache();
    }
    public setup(guild_id: string) {
        if (this.exists(guild_id)) return true;

        this.#db.query(`INSERT INTO sanctions (guild_id) VALUES ("${guild_id}")`, (e) => {
            if (e) console.log(e);
        });
    }
    public getAll(guild_id: string) {
        return (this.#cache.get(guild_id) ?? {}) as sanctions
    }
    public async applySanction({ guild, user, member, reason, key }: { guild: Guild, user: User, member: GuildMember, reason: string, key: Exclude<keyof sanctions, 'guild_id'> }) {
        if (!this.exists(guild.id)) {
            this.setup(guild.id);
            return false;
        };
        const sanction = this.getAll(guild.id)[key];

        switch (sanction.type) {
            case 'ban':
                await member.send({ embeds: [ classic(user)
                    .setTitle('🚫 Bannissement')
                    .setDescription(`Vous avez été banni de ${guild.name} par l'automodération (moi) pour la raison suivante \`\`\`${reason}\`\`\``)
                    .setColor('#ff0000')
                ] }).catch(() => {});

                member.ban({ reason, deleteMessageDays: 7 }).catch(() => {});
            break;
            case 'warn':
                addWarn({ guild_id: guild.id, user_id: member.id, mod_id: user.id, proof: '', reason: `${reason} (automodération)`, date: Date.now() });
            break;
            case 'kick':
                await member.send({ embeds: [ classic(user)
                    .setTitle("⛔ Expulsion")
                    .setDescription(`Vous avez été expulsé de ${guild.name} par l'automodération (moi) pour la raison suivante \`\`\`${reason}\`\`\``)
                    .setColor('#ff0000')
                ] }).catch(() => {});

                member.kick(`${reason} (automodération)`).catch(() => {});
            break;
            case 'mute':
                member.timeout(sanction.time * 1000, `${reason} (automodération)`).catch(() => {});
                member.send({ embeds: [ classic(user)
                    .setTitle('🤐 Mute')
                    .setDescription(`Vous avez été muté sur ${guild.name} par l'automodération (moi) pour la raison suivante \`\`\`${reason}\`\`\``)
                    .setFields(
                        {
                            name: 'Démutage',
                            value: `Vous serez débanni <t:${(Date.now() / 1000).toFixed(0) + sanction.time}:F>`,
                            inline: false
                        }
                    )
                    .setColor('#ff0000')
                ] }).catch(() => {});
            break;
            case 'tempban':
                await member.send({ embeds: [ classic(user)
                    .setTitle("🚫 Bannissement")
                    .setDescription(`Vous avez été banni de ${guild.name} par l'automodération (moi) pour la raison suivante \`\`\`${reason}\`\`\``)
                    .setFields(
                        {
                            name: 'Débannissement',
                            value: `Vous serez débanni <t:${(Date.now() / 1000).toFixed(0) + sanction.time}:F>`,
                            inline: false
                        }
                    )
                    .setColor('#ff0000')
                ] }).catch(() => {});

                tempBan({ guild_id: guild.id, user_id: member.id, mod_id: user.id, reason: `${reason} (automodération)`, proof: '', date: Date.now(), date_end: Date.now() + (sanction.time * 1000) });
            break;
        };

        addLog({ guild_id: guild.id, user_id: member.id, mod_id: user.id, proof: '', reason: `${reason} (automodération)`, date: Date.now() });
    }
    public set(guild_id: string, key: keyof sanctions, value: sanction) {
        let sql = `INSERT INTO sanctions (guild_id, ${key}) VALUES ("${guild_id}", '${JSON.stringify(value)}')`;
        if (this.exists(guild_id)) sql = `UPDATE sanctions SET ${key}='${JSON.stringify(value)}' WHERE guild_id="${guild_id}"`;

        this.#db.query(sql, (e) => {
            if (e) return console.log(e);

            this.fillCache();
        });
    }
    private exists(guild_id: string) {
        return this.#cache.has(guild_id);
    }
    private fillCache() {
        this.#db.query(`SELECT * FROM sanctions`, (err, req) => {
            if (err) return console.log(err);

            this.#cache.clear();
            req.forEach((r: sanctions) => {
                Object.keys(r).filter(x => x !== 'guild_id').forEach((x) => {
                    if (typeof r[x] !== 'object' && typeof r[x] === 'string') r[x] = JSON.parse(r[x]);
                });
                this.#cache.set(r.guild_id, r);
            });
        });
    }
};