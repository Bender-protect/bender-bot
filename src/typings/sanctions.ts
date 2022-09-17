type ban = {
    type: 'ban'
};
type mute = {
    type: 'mute';
    time: number
};
type warn = {
    type: 'warn'
};
type tempban = {
    type: 'tempban';
    time: number
};
type kick = {
    type: 'kick'
};

export type sanction = ban | kick | mute | tempban | warn;

export type sanctions = {
    guild_id: string;
    channelCreate: sanction;
    channelDelete: sanction;
    channelUpdate: sanction;
    roleCreate: sanction;
    roleDelete: sanction;
    roleUpdate: sanction;
    ban: sanction;
    spam: sanction;
    guildUpdate: sanction;
};

export type sanctionType = 'ban' | 'kick' | 'mute' | 'tempban' | 'warn';
export const sanctionNames: {name: string, value: keyof sanctions}[] = [
    { name: 'Création de salon', value: 'channelCreate' },
    { name: 'Suppression de salon', value: 'channelDelete' },
    { name: 'Modification de salon', value: 'channelUpdate' },
    { name: 'Création de rôle', value: 'roleCreate' },
    { name: 'Suppression de rôle', value: 'roleDelete' },
    { name: 'Modification de rôle', value: 'roleUpdate' },
    { name: 'Bannissements', value: 'ban' },
    { name: 'Spam', value: 'spam' },
    { name: 'Modification du serveur', value: 'guildUpdate' }
];
export const sanctionsTypes = [ 'ban', 'mute', 'kick', 'warn', 'tempban' ];
export const sanctionsValues = {
    ban: [ 'type' ],
    mute: [ 'type', 'time' ],
    kick: [ 'type' ],
    tempban: [ 'type', 'time' ],
    warn: [ 'type' ]
};
export const sanctionCorres = {
    ban: 'Bannissement',
    kick: "Expulsion",
    mute: 'Mute',
    tempban: 'Bannissement temporaire',
    warn: 'Avertissement'
};