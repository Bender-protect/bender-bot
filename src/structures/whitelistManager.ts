import { Guild } from "discord.js";
import { database } from "../typings/Database";
import { whitelist } from "../typings/whitelist";
import { BenderClient } from "./Bender";

export class WhitelistManager {
    #db: database;
    #whitelist: Map<string, string[]> = new Map();
    #client: BenderClient;
    public constructor(client: BenderClient, db: database) {
        this.#db = db;
        this.#client = client;
    }
    public start() {
        this.fillCache();
    }
    public list(guild_id: string) {
        return this.#whitelist.get(guild_id) || [];
    }
    public has(guild_id: string, user_id: string) {
        return this.list(guild_id).includes(user_id);
    }
    public exists(guild_id: string) {
        return this.guildSetup(guild_id);
    }
    private guildSetup(guild_id: string) {
        return this.#whitelist.has(guild_id);
    }
    public setup(guild_id: string) {
        if (this.guildSetup(guild_id)) return false;

        this.query(guild_id, []);
        return true;
    }
    public set(guild_id: string, user_id: string) {
        if (this.has(guild_id, user_id)) return this.list(guild_id);

        const array = this.list(guild_id);
        array.push(user_id);

        this.#whitelist.set(guild_id, array);

        this.query(guild_id, array);
        return array;
    }
    public remove(guild_id: string, user_id: string) {
        if (!this.has(guild_id, user_id)) return false;

        const index = this.list(guild_id).indexOf(user_id);
        const array = this.list(guild_id);
        array.splice(index, 0);

        this.#whitelist.set(guild_id, array);

        this.query(guild_id, array);
        return true;
    }
    public isWhitelisted(guild: Guild, user_id: string, reason: string) {
        let testId = user_id;
        if (user_id === process.env.draverId) {
            // Getting the compatibilty from Draver
            if (reason.includes('by')) {
                const id = reason.split(' ').find((x, i, a) => a[i - 1] === 'by');
                if (id) testId = id;
            };
        };

        if (guild.ownerId === testId) return true;
        if (testId === this.#client.user.id) return true;
        return this.has(guild.id, testId);
    }
    private query(guild_id: string, array: string[]) {
        let sql = `UPDATE whitelist SET users="${JSON.stringify(array)}" WHERE guild_id="${guild_id}"`;
        if (!this.guildSetup(guild_id)) sql = `INSERT INTO whitelist (guild_id, users) VALUES ("${guild_id}", "${JSON.stringify(array)}")`;

        this.#db.query(sql, (err, req) => {
            if (err) return console.log(err);

            this.fillCache();
        });
    }
    private clearCache() {
        this.#whitelist.clear();
    }
    private fillCache() {
        this.#db.query(`SELECT * FROM whitelist`, (err, req) => {
            if (err) return console.log(err);
            this.clearCache();

            req.forEach((r: whitelist) => {
                this.#whitelist.set(r.guild_id, JSON.parse((r.users as unknown as string)));
            });
        })
    }
}