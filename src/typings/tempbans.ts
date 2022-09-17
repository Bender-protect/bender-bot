export type tempban = {
    guild_id: string;
    user_id: string;
    mod_id: string;
    reason: string;
    date: number;
    date_end: number;
    proof: string;
};
export type tempbans = tempban[];