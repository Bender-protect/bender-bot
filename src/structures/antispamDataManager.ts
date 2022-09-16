import { antispam } from "../typings/antispam";
import { database } from "../typings/Database";
import { BenderClient } from "./Bender";

export class antispamDataManager {
    #client: BenderClient;
    #db: database;
    #cache: Map<string, antispam> = new Map();
    constructor(client: BenderClient, db: database) {
        this.#client = client;
        this.#db = db;
    }
    public start() {
        this.fillCache()
    }
    public set(guild_id: string, config: keyof antispam, state: number) {
        const data = this.get(guild_id);
        data[(config) as Exclude<string, 'guild_id'>] = state;

        let sql = `INSERT INTO antispam (guild_id, ${config}) VALUES ("${guild_id}", "${state}")`;
        if (this.#cache.has(guild_id)) sql = `UPDATE antispam SET ${config}="${state}"`;

        this.#cache.set(guild_id, data);
        this.#db.query(sql, (e) => {
            if (e) return console.log(e);
        });
    }
    public get(guild_id: string) {
        return this.#cache.get(guild_id) || { guild_id, count: 6, time: 10 };
    }
    private clearCache() {
        this.#cache.clear();
    }
    private fillCache() {
        this.#db.query(`SELECT * FROM antispam`, (err, req) => {
            if (err) return console.log(err);

            this.clearCache();
            req.forEach((r: antispam) => {
                this.#cache.set(r.guild_id, r);
            });
        });
    }
}