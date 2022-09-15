import { BaseGuildVoiceChannel, EmbedBuilder, User } from "discord.js";
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
        .setTitle("❌ Pas de configuration")
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
        .setTitle("❌ Déjà configuré")
};