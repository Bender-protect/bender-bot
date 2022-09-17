import { Bender } from "../bender";
import { Event } from "../structures/Event";
import { tempbans } from "../typings/tempbans";

export default new Event('ready', () => {
    setInterval(() => {
        Bender.db.query(`SELECT * FROM tempbans WHERE date_end <= "${Date.now()}"`, async(err, req: tempbans) => {
            if (err) return console.log(err);

            await Bender.guilds.fetch()
            const guildFetched = [];
            req.forEach(async(re) => {
                const guild = Bender.guilds.cache.get(re.guild_id);
                if (!guild) return;
                if (!guildFetched.includes(guild.id)) {
                    guildFetched.push(guild.id);
                    await guild.members.fetch();
                };
                
                guild.bans.remove(guild.members.cache.get(re.user_id), 'automod unban').catch(() => {});
            });
        });
    }, 15000);
});