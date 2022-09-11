CREATE TABLE whitelist (
    guild_id VARCHAR(255) NOT NULL,
    users LONGTEXT NOT NULL DEFAULT '[]'
)