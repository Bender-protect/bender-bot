import { configs } from "../typings/configs";
import { database } from "../typings/Database";
import { BenderClient } from "./Bender";

export class configsManager {
    client: BenderClient;
    db: database;
    #configs: Map<string, configs> = new Map();
    constructor(client: BenderClient, db: database) {
        this.client = client;
        this.db = db;
    }
    public start() {
        this.fillCache();
    }
    public set(guild_id: string, key: keyof configs, value: boolean) {
        if (key === 'guild_id') return 'invalid key';
        const bool = value ? '1':'0';

        if (!this.#configs.has(guild_id)) {
            this.db.query(`INSERT INTO configs (guild_id, ${key}) VALUES ("${guild_id}", "${bool}")`, (err, req) => {
                if (err) return console.log(err);

                this.fillCache();
            });
        } else {
            this.db.query(`UPDATE configs SET ${key} = "${bool}" WHERE guild_id = "${guild_id}"`, (err, req) => {
                if (err) return console.log(err);

                this.fillCache();
            });
        };
    }
    public get(guild_id: string) {
        return this.#configs.get(guild_id) as configs | undefined;
    }
    public has(guild_id: string) {
        return this.#configs.has(guild_id);

    }
    private clearCache() {
        this.#configs.clear();
    }
    private fillCache() {
        this.db.query(`SELECT * FROM configs`, (err, request) => {
            this.clearCache();
            request.forEach((req: configs) => {
                Object.keys(req).forEach((k) => {
                    if (k === 'guild_id') return;
                    req[k] = req[k] === 1;
                });

                this.#configs.set(req.guild_id, req);
            });
        });
    }
}