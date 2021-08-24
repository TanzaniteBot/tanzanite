// import { BushCommand, BushMessage, BushSlashMessage, guildFeatures } from '@lib';
// import { MessageEmbed } from 'discord.js';

// export default class FeaturesCommand extends BushCommand {
// 	public constructor() {
// 		super('features', {
// 			aliases: ['features'],
// 			category: 'config',
// 			description: {
// 				content: 'Toggle features the server.',
// 				usage: 'features',
// 				examples: ['features']
// 			},
// 			slash: true,
// 			channel: 'guild',
// 			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
// 			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD']
// 		});
// 	}
// 	public override async exec(message: BushMessage | BushSlashMessage): Promise<unknown> {
// 		if (!message.guild) return await message.util.reply(`${util.emojis.error} This command can only be used in servers.`);
// 		const featureEmbed = new MessageEmbed().setTitle(`${message.guild.name}'s Features`).setColor(util.colors.default);
// 		const featureList: string[] = [];
// 		const enabledFeatures = await message.guild.getSetting('enabledFeatures');
// 		guildFeatures.forEach((feature) => {
// 			// featureList.push(`**${feature}:** ${enabledFeatures.includes(feature)? util.emojis.}`);
// 		});
// 	}
// }
