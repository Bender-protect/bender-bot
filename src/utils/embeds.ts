import { BaseGuildVoiceChannel, EmbedBuilder, User } from "discord.js";
import { antispam } from "../typings/antispam";
import { configs, configTypes } from "../typings/configs";
import { sanctionCorres, sanctionNames, sanctions } from "../typings/sanctions";

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

    const calcTime = (n: number) => {
        let m = 0;
        let u = 0;
        for (let i = 0; i < n; i++) {
            n-1; 
            u++;
            if (u === 60) {
                m++;
                u=0;
            };
        };

        let r = (u * 100) / 60;
        return (m + r);
    };
    Object.keys(configs).filter(x => x !== 'guild_id').forEach((config, index) => {
        const c = sanctionNames.find(x => x.value === config);
        embed.addFields(
            {
                name: c.name,
                value: `${sanctionCorres[(configs[config].type)]}${configs[config]?.time ? ` pendant ${calcTime(configs[config].time)} minutes`:''}`,
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