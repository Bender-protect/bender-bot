import { Bender } from "../bender";
import { Event } from "../structures/Event";

export default new Event('messageCreate', (message) => {
    if (!message.guild) return;
    if (Bender.configsManager.state(message.guild.id, 'anticap') && !Bender.whitelistManager.isWhitelisted(message.guild, message.author.id)) {
        let caps = 0;
        for (let i = 0; i < message.content.length; i++) {
            if (message.content[i] !== message.content[i].toUpperCase()) caps++;
        };

        let rate = (caps * 100) / message.content.length;

        Bender.db.query(`SELECT rate FROM anticap WHERE guild_id='${message.guild.id}'`, (e, r) => {
            if (e) return console.log(e);

            const allowed = r[0]?.rate ?? 25;
            if (allowed < rate) {
                Bender.sanctionsManager.applySanction({
                    guild: message.guild,
                    member: message.member,
                    user: message.client.user,
                    key: 'anticap',
                    reason: 'trop de majuscules'
                });
            };
        });
    }
});