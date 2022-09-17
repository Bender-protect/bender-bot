CREATE TABLE whitelist (
    guild_id VARCHAR(255) NOT NULL,
    users LONGTEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE configs (
    guild_id VARCHAR(255) NOT NULL PRIMARY KEY,
    raidmode TINYINT(1) NOT NULL DEFAULT "0",
    channelUpdate_enable TINYINT(1) NOT NULL DEFAULT "1",
    channelCreate_enable TINYINT(1) NOT NULL DEFAULT "1",
    channelDelete_enable TINYINT(1) NOT NULL DEFAULT "1",
    roleCreate_enable TINYINT(1) NOT NULL DEFAULT "1",
    roleDelete_enable TINYINT(1) NOT NULL DEFAULT "1",
    roleUpdate_enable TINYINT(1) NOT NULL DEFAULT "1",
    allowBan TINYINT(1) NOT NULL DEFAULT '1',
    antispam TINYINT(1) NOT NULL DEFAULT "1",
    gban TINYINT(1) NOT NULL DEFAULT '1',
    guildUpdate_enable TINYINT(1) NOT NULL DEFAULT '1'
);

CREATE TABLE gbans (
    users LONGTEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE antispam (
    guild_id VARCHAR(255) NOT NULL,
    count INTEGER(255) NOT NULL DEFAULT '6',
    time INTEGER(255) NOT NULL DEFAULT '10'
);

CREATE TABLE sanctions (
    guild_id VARCHAR(255) NOT NULL PRIMARY KEY,
    channelCreate LONGTEXT NOT NULL DEFAULT '{"type": "warn"}',
    channelDelete LONGTEXT NOT NULL DEFAULT '{"type": "warn"}',
    channelUpdate LONGTEXT NOT NULL DEFAULT '{"type": "warn"}',
    roleCreate LONGTEXT NOT NULL DEFAULT '{"type": "warn"}',
    roleUpdate LONGTEXT NOT NULL DEFAULT '{"type": "warn"}',
    roleDelete LONGTEXT NOT NULL DEFAULT '{"type": "warn"}',
    spam LONGTEXT NOT NULL DEFAULT '{"type": "mute", "time": 300}',
    ban LONGTEXT NOT NULL DEFAULT '{"type": "warn"}'
);

CREATE TABLE warns (
    guild_id VARCHAR(255) NOT NULL,
    mod_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    date VARCHAR(255) NOT NULL,
    proof VARCHAR(255) NOT NULL DEFAULT '',
    reason VARCHAR(255) NOT NULL
);
CREATE TABLE logs (
    guild_id VARCHAR(255) NOT NULL,
    mod_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    date VARCHAR(255) NOT NULL,
    proof VARCHAR(255) NOT NULL DEFAULT '',
    reason VARCHAR(2000) NOT NULL,
    id INTEGER(11) NOT NULL PRIMARY KEY AUTO_INCREMENT
);
CREATE TABLE tempbans (
    guild_id VARCHAR(255) NOT NULL,
    mod_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    date VARCHAR(255) NOT NULL,
    date_end VARCHAR(255) NOT NULL,
    proof VARCHAR(255) NOT NULL DEFAULT '',
    reason VARCHAR(255) NOT NULL
);