import { config } from 'dotenv';
import { createConnection } from 'mysql';
import { DatabaseTables, DefaultQueryResult, QueryResult } from '../typings/database';
config();

export const database = createConnection({
    database: process.env.db,
    host: process.env.dbH,
    user: process.env.dbU,
    password: process.env.dbP
});

export const query = <T = DefaultQueryResult>(query: string): Promise<QueryResult<T>> => {
    return new Promise((resolve, reject) => {
        database.query(query, (error, request) => {
            if (error) return reject(error);
            resolve(request);
        });
    });
};
export const buildDatabase = async () => {
    await query('SHOW TABLES');

    await query(
        `CREATE TABLE IF NOT EXISTS ${DatabaseTables.WhiteList} ( guild_id VARCHAR(255) NOT NULL PRIMARY KEY, owner VARCHAR(255) NOT NULL, list LONGTEXT )`
    );
    return true;
};
