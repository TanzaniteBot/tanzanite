import { BushCommand, BushMessage, BushSlashMessage, GuildFeatures, guildFeaturesArr, guildFeaturesObj } from '@lib';
import { Message, MessageActionRow, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from 'discord.js';

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
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD']
		});
	}
	public override async exec(message: BushMessage | BushSlashMessage): Promise<unknown> {
		if (!message.guild) return await message.util.reply(`${util.emojis.error} This command can only be used in servers.`);
		const featureEmbed = new MessageEmbed().setTitle(`${message.guild!.name}'s Features`).setColor(util.colors.default);

		const enabledFeatures = await message.guild!.getSetting('enabledFeatures');
		this.generateDescription(guildFeaturesArr, enabledFeatures, featureEmbed);
		const components = this.generateComponents(guildFeaturesArr, false);
		const msg = (await message.util.reply({ embeds: [featureEmbed], components: [components] })) as Message;
		const collector = msg.createMessageComponentCollector({
			channel: message.channel ?? undefined,
			guild: message.guild,
			componentType: 'SELECT_MENU',
			message: message as Message,
			time: 300_000
		});

		collector.on('collect', async (interaction: SelectMenuInteraction) => {
			if (interaction.user.id === message.author.id || client.config.owners.includes(interaction.user.id)) {
				if (!message.guild) throw new Error('message.guild is null');

				const [selected]: GuildFeatures[] = interaction.values as GuildFeatures[];

				if (!guildFeaturesArr.includes(selected)) throw new Error('Invalid guild feature selected');

				const newEnabledFeatures = await message.guild.toggleFeature(selected);

				this.generateDescription(guildFeaturesArr, newEnabledFeatures, featureEmbed);

				await interaction.update({ embeds: [featureEmbed] }).catch(() => undefined);

				return;
			} else {
				return await interaction?.deferUpdate().catch(() => undefined);
			}
		});

		collector.on('end', async () => {
			await msg.edit({ components: [this.generateComponents(guildFeaturesArr, false)] }).catch(() => undefined);
		});
	}

	public generateDescription(allFeatures: GuildFeatures[], currentFeatures: GuildFeatures[], embed: MessageEmbed): void {
		embed.setDescription(
			allFeatures
				.map(
					(feature) =>
						`${currentFeatures.includes(feature) ? util.emojis.check : util.emojis.cross} **${guildFeaturesObj[feature].name}**`
				)
				.join('\n')
		);
	}

	public generateComponents(guildFeatures: GuildFeatures[], disable: boolean): MessageActionRow {
		return new MessageActionRow().addComponents(
			new MessageSelectMenu()
				.addOptions(
					...guildFeatures.map((f) => ({
						label: guildFeaturesObj[f].name,
						value: f,
						description: guildFeaturesObj[f].description
					}))
				)
				.setPlaceholder('Select A Feature to Toggle')
				.setMaxValues(1)
				.setMinValues(1)
				.setCustomId('command_selectFeature')
				.setDisabled(disable)
		);
	}
}
