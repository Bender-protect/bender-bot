import { EmbedBuilder, User } from "discord.js";
import { BenderClient } from "../structures/Bender";
import { antispam } from "../typings/antispam";
import { configs, configTypes } from "../typings/configs";
import { sanctionCorres, sanctionNames, sanctions } from "../typings/sanctions";
import { calcTime } from "./functions";

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
};
export const cancel = () => new EmbedBuilder({ title: '💡 Commande annulée' }).setColor('Yellow');

export const sanctionConfigs = (user: User, configs: sanctions) => {
    const embed = basic(user)
        .setTitle("ℹ️ Configurations")
        .setDescription(`Voici les configuration des sanctions du serveur`)
        .setColor('#00ff00')

    
    Object.keys(configs).filter(x => x !== 'guild_id').forEach((config, index) => {
        const c = sanctionNames.find(x => x.value === config);
        embed.addFields(
            {
                name: c.name,
                value: `${sanctionCorres[(configs[config].type)]}${configs[config]?.time ? ` pendant ${calcTime(configs[config].time)}`:''}`,
                inline: true
            }
        );

        if (index % 3 === 0 && index !== 0) {
            embed.addFields({
                name: '\u200b',
                value: '\u200b',
                inline: false
            });
        };
    });

    return embed;
};
export const anticapDisabled = (user: User) => {
    return basic(user)
        .setTitle("❌ Anti-majuscules désactivé")
        .setDescription(`L'anti-majuscules est désactivé sur ce serveur.\nUtilisez la commande \`/set\` pour l'activer`)
        .setColor('#ff0000')
};
export const anticapConfig = (user: User, percentage: number) => {
    const fields = [
        {
            name: 'Pourcentage autorisé',
            value: `${percentage}% de majuscules sont autorisées dans un message`,
            inline: true
        }
    ];

    if (Math.floor(Math.random() * 10) === 5) fields.push({
        name: '🚨 Configuration',
        value: `Vous pouvez configurer l'anti majuscules avec la commande \`/anticap\``,
        inline: false
    });
    return basic(user)
        .setTitle("ℹ️ Configurations de l'anti-majuscules")
        .setDescription(`L'anti majuscules est configuré sur votre serveur.`)
        .setColor('#00ff00')
        .setFields(fields)
};
export const perms = {
    client: (user: User) => basic(user).setTitle("🚫 Permission invalides").setDescription(`Je n'ai pas les permissions suffisantes pour exécuter cette action.\n💡\n> Vérifiez mes permissions de rôle\n> Vérifiez la position de mon rôle dans la hiéararchie des rôles`).setColor('#ff0000'),
    userPerms: (user: User) => basic(user).setTitle('🚫 Permissions insuffisantes').setDescription(`Vous n'avez pas la permission de faire cette action`).setColor('#ff0000'),
    memberPosition: (user: User, state: 'vous' | 'moi') => basic(user).setTitle('🚫 Position invalide').setDescription(`Cet utilisateur est **supérieur** ou **égal** à ${state}`).setColor('#ff0000'),
    owner: (user: User, owner: User) => basic(user).setTitle('🚫 Propriétaire du serveur').setDescription(`<@${owner.id}> est le propriétaire du serveur.\nVous ne pouvez pas exécuter cette action sur le propriétaire du serveur`).setColor('#ff0000'),
    selfUser: (user: User) => basic(user).setTitle('🚫 Auto-ciblage').setDescription(`Vous ne pouvez pas faire ça sur vous même`).setColor('#ff0000'),
    bot: (user: User) => basic(user).setTitle('🚫 Bot').setDescription(`Je ne peux pas faire cette action sur un bot`).setColor('#ff0000')
};
export const interactionNotAllowed = (user: User) => {
    return basic(user)
        .setTitle("🚫 Interaction refusée")
        .setDescription(`Vous ne pouvez pas interagir avec cette interaction`)
        .setColor('#ff0000')
};
export const paginationSelect = (user: User) => {
    return basic(user)
        .setTitle("❓ Page")
        .setDescription(`Quelle page souhaitez-vous consulter ?`)
        .setColor('Yellow')
};
export const paginatorClosed = (user: User, name: string) => basic(user)
    .setTitle("🚨 Paginateur fermé")
    .setDescription(`Vous avez fermé le paginateur \`${name}\``)
    .setColor('#00ff00');

export const invalidProofType = (user: User) => basic(user)
    .setTitle("❌ Preuve invalide")
    .setDescription(`Les preuves ne sont acceptées que sous fichier image`)
    .setColor('#ff0000');
export const resetWarnConfirm = (user: User, u?: User) => {
    return basic(user)
        .setTitle('❓ Réinitialisation')
        .setDescription(u ? `Voulez-vous réinitialiser les avertissements de <@${u.id}> ?` : "Voulez-vous réinitialiser les avertissements du serveur ?")
        .setColor('Grey')
};
export const warnReset = (user: User, u?: User) => {
    return basic(user)
        .setTitle('🧹 Réinitialisation')
        .setDescription(`Les avertissements ${u ? `de <@${u.id}>`: `du serveur`} ont été réinitialisés.`)
        .setColor('#00ff00')
};
export const unexistingWarn = ({ user, u, id }:{user: User, u: User, id: number}) => {
    return basic(user)
        .setTitle("❌ Avertissement inexistant")
        .setDescription(`<@${u.id}> n'a pas d'avertissement avec l'identifiant \`${id}\``)
        .setColor('#ff0000')
};
export const deleteWarnConfirm = ({ user, u, reason, image }: { user: User, u: User, reason: string, image?: string }) => {
    const embed = classic(user)
        .setTitle('❓ Suppression')
        .setDescription(`Voulez-vous supprimer l'avertissement de <@${u.id}> ?`)
        .setFields({
            name: 'Raison',
            value: reason,
            inline: false
        })
        .setColor('Yellow')
    
    if (image) embed.setImage(image);
    return embed;
};
export const deleteWarn = ({ user, u, id }: { user: User, u: User, id: number }) => {
    return basic(user)
        .setTitle('👮 Suppression d\'avertissement')
        .setDescription(`L'avertissement d'identifiant \`${id.toString()}\` de <@${u.id}> a été supprimé`)
        .setColor('#00ff00')
};
export const guildCreateMsg = (client: BenderClient) => {
    return basic(client.user)
        .setTitle('💡 Bender Protect')
        .setDescription(`Bonjour, je suis Bender Protect, un bot de protection pour votre serveur open source.\n> Merci de m'avoir ajouté ❤️\n\nUtilisez la commande \`/set initialiser\` pour faire les premières configurations de Bender Protect.\nEnsuite vous pouvez utiliser ma commande \`/help\` pour obtenir la liste des commandes.\n\nSi vous rencontrez tout problème, contactez mon [support](${process.env.support})`)
        .setColor('Yellow')
        .setFields(
            {
                name: 'Liens',
                value: `[Support](${process.env.support})\n[Code source](${process.env.github})`,
                inline: true
            },
            {
                name: 'Commande utiles',
                value: client.usefullCommands.map((cmd) => `</${cmd.name}:${cmd.id}>`).join(' '),
                inline: true
            }
        )
        .setThumbnail('attachment://logo.png')
}