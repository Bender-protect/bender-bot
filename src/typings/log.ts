export type log = {
    reason: string;
    mod_id: string;
    user_id: string;
    date: number;
    guild_id: string;
    proof: string;
    type: string;
    id?: number;
};
export type logs = log[];