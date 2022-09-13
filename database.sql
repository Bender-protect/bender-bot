CREATE TABLE whitelist (
    guild_id VARCHAR(255) NOT NULL,
    users LONGTEXT NOT NULL DEFAULT '[]'
)

CREATE TABLE configs (
    guild_id VARCHAR(255) NOT NULL PRIMARY KEY,
    raidmode TINYINT(1) NOT NULL DEFAULT "0",
    channelUpdate_enable TINYINT(1) NOT NULL DEFAULT "1",
    channelCreate_enable TINYINT(1) NOT NULL DEFAULT "1",
    channelDelete_enable TINYINT(1) NOT NULL DEFAULT "1",
    roleCreate_enable TINYINT(1) NOT NULL DEFAULT "1",
    roleDelete_enable TINYINT(1) NOT NULL DEFAULT "1",
    roleUpdate_enable TINYINT(1) NOT NULL DEFAULT "1",
    guildBanAdd_enable TINYINT(1) NOT NULL DEFAULT "1"
)