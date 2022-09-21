export type warn = {
    reason: string;
    mod_id: string;
    user_id: string;
    date: number;
    guild_id: string;
    proof: string;
    id?: number;
};
export type warns = warn[];