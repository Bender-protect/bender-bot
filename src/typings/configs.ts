export type configs = {
    guild_id: string;
    raidmode: boolean;
    channelUpdate_enable: boolean;
    channelCreate_enable: boolean;
    channelDelete_enable: boolean;
    roleCreate_enable: boolean;
    roleDelete_enable: boolean;
    roleUpdate_enable: boolean;
    gban: boolean;
    allowBan: boolean;
    antispam: boolean;
    guildUpdate_enable: boolean;
    anticap: boolean;
    newAccounts: boolean;
    member_update: boolean;
    member_update_strict: boolean;
};

export const configTypes: { name: string, value: keyof configs }[] = [
    { name: 'Raidmode', value: 'raidmode' },
    { name: 'Modification de salon', value: 'channelUpdate_enable' },
    { name: 'Création de salon', value: 'channelCreate_enable' },
    { name: 'Suppression de salon', value: 'channelDelete_enable' },
    { name: 'Création de rôle', value: 'roleCreate_enable' },
    { name: 'Suppression de rôle', value: 'roleDelete_enable' },
    { name: 'Modification de rôle', value: 'roleUpdate_enable' },
    { name: 'GBan', value: 'gban' },
    { name: 'Autorisation des bannissements', value: 'allowBan' },
    { name: 'Antispam', value: 'antispam' },
    { name: "Modification du serveur", value: 'guildUpdate_enable' },
    { name: 'Anti lettres majuscules', value: 'anticap' },
    { name: 'Anti nouveaux-comptes', value: 'newAccounts' },
    { name: "Anti modification de membres", value: 'member_update' },
    { name: 'Anti modification de membres strict', value: 'member_update' }
];