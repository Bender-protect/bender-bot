import { BaseGuildVoiceChannel, EmbedBuilder, User } from "discord.js";
import { antispam } from "../typings/antispam";
import { configs, configTypes } from "../typings/configs";

const basic = (user: User) => {
    return new EmbedBuilder()
        .setFooter({ text: user.username, iconURL: user.displayAvatarURL({ forceStatic: false }) })
        .setTimestamp()
};

export const classic = basic;
export const sqlError = (user: User) => {
    return basic(user)
        .setTitle("❌ Erreur")
        .setDescription(`Vous ne devriez pas rencontrer cette erreur.\nUne erreur a eu lieu lors de l'interaction avec la base de données`)
        .setColor('#ff0000')
};
export const noConfigured = (user: User) => {
    return basic(user)
        .setTitle("⚠️ Pas de configuration")
        .setDescription(`Il n'y a pas de configuration sur ce serveur.\nUtilisez la commande \`/set intialiser\` pour initialiser le bot.`)
        .setColor('#ff0000')
};
export const notWhitelisted = (user: User) => {
    return basic(user)
        .setTitle("⛔ Non-whitelisté")
        .setDescription(`Vous n'êtes pas whitelisté sur le serveur, vous ne pouvez pas effectuer cette action`)
        .setColor('#ff0000')
};
export const ownerOnly = (user: User, ownerId: string) => {
    return basic(user)
        .setTitle("⛔ Propriétaire uniquement")
        .setDescription(`Cette commande n'est exécutable que par le propriétaire du serveur ( <@${ownerId}> )`)
        .setColor('#ff0000')
};
export const config = (user: User, option: keyof configs, value: boolean) => {
    const param = configTypes.find(x => x.value === option);
    return basic(user)
        .setTitle("✅ Configuration")
        .setDescription(`Le paramètre \`${param.name}\` a été **${value ? 'activé' : 'désactivé'}**`)
        .setColor('#00ff00')
};
export const setup = (user: User) => {
    return basic(user)
        .setTitle("✅ Configuré")
        .setDescription(`Bender Protect a été configuré sur votre serveur`)
        .setColor('#00ff00')
};
export const setupEd = (user: User) => {
    return basic(user)
        .setDescription(`Bender Protect est déjà configuré sur votre serveur`)
        .setColor('#ff0000')
        .setTitle("⚠️ Déjà configuré")
};
export const gbanned = (user: User) => {
    return basic(user)
        .setTitle("⛔ GBan")
        .setDescription(`Vous êtes Guild-ban sur Bender Protect, et ce serveur n'accepte pas les membres GBannis.`)
        .setColor('#ff0000')
};
export const gbanDisabled = (user: User) => {
    return basic(user)
        .setTitle("⚠️ GBan désactivé")
        .setDescription(`Le système de GBan est désactivé sur ce serveur.\nUtilisez la commande </set:${user.client.application.commands.cache.find(x => x.name === 'set').id}>`)
        .setColor('#ff0000')
};
export const antispamDisabled = (user: User) => {
    return basic(user)
        .setTitle('⚠️ Antispam désactivé')
        .setDescription(`L'antispam est désactivé sur votre serveur.\nActivez-le via la commande \`/set\``)
        .setColor('#ff0000')
};
export const antispamConfigs = (user: User, configs: antispam) => {
    const fields = [
        {
            name: 'Messages',
            value: `${configs.count} messages`,
            inline: true
        },
        {
            name: 'Temps',
            value: `${configs.time} secondes`,
            inline: true
        }
    ];
    if (Math.floor(Math.random() * 100) <= 100 / 3) fields.push(
        {
            name: '🚨 À noter',
            value: `À noter que la limite est de ${configs.count} messages en ${configs.time} secondes`,
            inline: false
        }
    );
    return basic(user)
        .setTitle('ℹ️ Antispam')
        .setDescription(`L'antispam de <@${user.client.user.id}> a été configuré sur votre serveur`)
        .setColor('#00ff00')
        .setFields(fields)
}