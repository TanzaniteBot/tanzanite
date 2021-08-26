import { BushCommand, BushMessage, BushSlashMessage, GuildFeatures, guildFeatures } from '@lib';
import { Message, MessageActionRow, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from 'discord.js';

//todo: fix this so that it doesn't just select one feature but instead toggles it
export default class FeaturesCommand extends BushCommand {
	public constructor() {
		super('features', {
			aliases: ['features'],
			category: 'config',
			description: {
				content: 'Toggle features the server.',
				usage: 'features',
				examples: ['features']
			},
			slash: true,
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD'],
			ownerOnly: true
		});
	}
	public override async exec(message: BushMessage | BushSlashMessage): Promise<unknown> {
		if (!message.guild) return await message.util.reply(`${util.emojis.error} This command can only be used in servers.`);
		const featureEmbed = new MessageEmbed().setTitle(`${message.guild!.name}'s Features`).setColor(util.colors.default);

		const enabledFeatures = await message.guild!.getSetting('enabledFeatures');
		let featureList = guildFeatures.map(
			(feature) => `**${feature}:** ${enabledFeatures.includes(feature) ? util.emojis.check : util.emojis.cross}`
		);
		featureEmbed.setDescription(featureList.join('\n'));
		const components = new MessageActionRow().addComponents(
			new MessageSelectMenu()
				.addOptions(...guildFeatures.map((f) => ({ label: f, value: f })))
				.setPlaceholder('Select A Feature to Toggle')
				.setMaxValues(1)
				.setMinValues(1)
				.setCustomId('featureCommand_selectFeature')
		);
		const x = (await message.util.reply({ embeds: [featureEmbed], components: [components] })) as Message;
		const collector = x.createMessageComponentCollector({
			channel: message.channel ?? undefined,
			guild: message.guild,
			componentType: 'SELECT_MENU',
			message: message as Message,
			time: 300_000
		});
		collector.on('collect', async (interaction: SelectMenuInteraction) => {
			if (interaction.user.id == message.author.id || client.config.owners.includes(interaction.user.id)) {
				if (!message.guild) throw new Error('message.guild is null');
				const [selected] = interaction.values;
				if (!guildFeatures.includes(selected)) throw new Error('Invalid guild feature selected');
				await message.guild.toggleFeature(selected as GuildFeatures);
				const enabledFeatures = await message.guild!.getSetting('enabledFeatures');
				featureList = guildFeatures.map(
					(feature) => `**${feature}:** ${enabledFeatures.includes(feature) ? util.emojis.check : util.emojis.cross}`
				);
				featureEmbed.setDescription(featureList.join('\n'));
				await interaction.update({ embeds: [featureEmbed] }).catch(() => undefined);
				return;
			} else {
				return await interaction?.deferUpdate().catch(() => undefined);
			}
		});
	}
}
