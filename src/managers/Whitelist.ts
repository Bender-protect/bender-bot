import { Collection } from 'discord.js';
import { DatabaseTables, whitelist, whitelistedAccess } from '../typings/database';
import { query } from '../utils/database';

export class WhitelistManager {
    private _cache: Collection<string, whitelist<false>> = new Collection();
    constructor() {
        this.start();
    }

    public getAccess<Force extends boolean = false>(
        guild_id: string,
        user_id: string
    ): Force extends true ? whitelistedAccess : false | whitelistedAccess {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!this.isWhitelisted(guild_id, user_id)) return false as any;
        if (this.isOwner(guild_id, user_id)) return 'admin';

        return this.getList(guild_id).find((x) => x.user_id === user_id).access;
    }
    public isWhitelisted(guild_id: string, user_id: string) {
        return this.getList(guild_id).find((x) => x.user_id === user_id) ? true : false;
    }
    public getList(guild_id: string) {
        return this._cache.get(guild_id)?.list ?? [];
    }
    public getOwner(guild_id: string) {
        return this._cache.get(guild_id)?.owner;
    }
    public isOwner(guild_id: string, user_id: string) {
        return this.getOwner(guild_id) === user_id;
    }
    public init(guild_id: string, owner: string) {
        if (this._cache.has(guild_id)) return false;
        this._cache.set(guild_id, {
            list: [],
            owner,
            guild_id
        });

        query(
            `INSERT INTO ${DatabaseTables.WhiteList} ( guild_id, owner, list ) VALUES ( '${guild_id}', '${owner}', '[]' )`
        );
        return true;
    }
    public setAccess(guild_id: string, user_id: string, access: whitelistedAccess) {
        if (this.isOwner(guild_id, user_id)) return true;

        const list = this.getList(guild_id);
        if (!list.find((x) => x.user_id === user_id)) {
            list.push({
                user_id: user_id,
                access
            });
        } else {
            const index = list.indexOf(list.find((x) => x.user_id === user_id));
            list[index].access = access;
        }

        this._cache.set(guild_id, {
            ...this._cache.get(guild_id),
            list
        });
        query(`UPDATE ${DatabaseTables.WhiteList} SET list='${JSON.stringify(list)}' WHERE guild_id='${guild_id}'`);
        return list;
    }
    public removeAccess(guild_id: string, user_id: string) {
        if (this.isOwner(guild_id, user_id)) return false;

        const list = this.getList(guild_id);
        if (!this.isWhitelisted(guild_id, user_id)) return true;

        list.splice(list.indexOf(list.find((x) => x.user_id === user_id)), 1);
        this._cache.set(guild_id, {
            ...this._cache.get(guild_id),
            list
        });
        query(`UPDATE ${DatabaseTables.WhiteList} SET list='${JSON.stringify(list)}' WHERE guild_id='${guild_id}'`);
        return true;
    }

    private start() {
        this.fillCache();
    }
    private async fillCache() {
        const data = await query<whitelist>(`SELECT * FROM ${DatabaseTables.WhiteList}`);

        data.forEach((v) => {
            this._cache.set(v.guild_id, {
                ...v,
                list: JSON.parse(v.list)
            });
        });
    }
    public get cache() {
        return this._cache;
    }
}
