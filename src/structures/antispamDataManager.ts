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