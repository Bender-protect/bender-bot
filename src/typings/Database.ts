import { If } from 'discord.js';

export type DefaultQueryResult = {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    serverStatus: number;
    warningCount: number;
    message: string;
    protocol41: boolean;
    changedRows: number;
};
export type QueryResult<T> = T extends DefaultQueryResult ? DefaultQueryResult : T[];
export enum DatabaseTables {
    WhiteList = 'whitelist'
}
export type whitelistedAccess = 'admin' | 'mod' | 'manager';
export type whitelist<Raw extends boolean = true> = {
    guild_id: string;
    owner: string;
    list: If<Raw, string, { user_id: string; access: whitelistedAccess }[]>;
};
