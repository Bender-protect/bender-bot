export type callBack = (err?: string, request?: any[]) => any;
export type query = (sql: string, callback: callBack) => any;
export type connect = (callback: (error?: string) => any) => any;

export type database = {
    query: query,
    connect: connect;
};
