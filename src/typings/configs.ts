export type configs = {
    guild_id: string;
    raidmode: boolean;
    channelUpdate_enable: boolean;
    channelCreate_enable: boolean;
    channelDelete_enable: boolean;
    roleCreate_enable: boolean;
    roleDelete_enable: boolean;
    roleUpdate_enable: boolean;
    guildBanAdd_enable: boolean;
}

export const types = ['raidmode', 'channelUpdate_enable']