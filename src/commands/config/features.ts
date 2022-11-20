import {
	BotCommand,
	colors,
	emojis,
	guildFeaturesArr,
	guildFeaturesObj,
	type CommandMessage,
	type GuildFeatures,
	type SlashMessage
} from '#lib';
import {
	ActionRowBuilder,
	ComponentType,
	EmbedBuilder,
	StringSelectMenuBuilder,
	type Message,
	type StringSelectMenuInteraction
} from 'discord.js';
import assert from 'node:assert/strict';

export default class FeaturesCommand extends BotCommand {
	public constructor() {
		super('features', {
			aliases: ['features'],
			category: 'config',
			description: 'Toggle the features of the server.',
			usage: ['features'],
			examples: ['features'],
			slash: true,
			channel: 'guild',
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: ['ManageGuild']
		});
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		assert(message.inGuild());

		const featureEmbed = new EmbedBuilder().setTitle(`${message.guild.name}'s Features`).setColor(colors.default);

		const hideHidden = !message.author.isOwner();

		const enabledFeatures = await message.guild.getSetting('enabledFeatures');
		this.generateDescription(guildFeaturesArr, enabledFeatures, featureEmbed, hideHidden);
		const components = this.generateComponents(guildFeaturesArr, false, hideHidden);
		const msg = (await message.util.reply({ embeds: [featureEmbed], components: [components] })) as Message;
		const collector = msg.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			time: 300_000,
			filter: (i) => i.guildId === msg.guildId && i.message?.id === msg.id
		});

		collector.on('collect', async (interaction: StringSelectMenuInteraction) => {
			if (interaction.user.id === message.author.id || this.client.config.owners.includes(interaction.user.id)) {
				assert(message.inGuild());

				const [selected]: GuildFeatures[] = interaction.values as GuildFeatures[];

				if (!guildFeaturesArr.includes(selected)) throw new Error('Invalid guild feature selected');

				const newEnabledFeatures = await message.guild.toggleFeature(selected, message.member!);

				this.generateDescription(guildFeaturesArr, newEnabledFeatures, featureEmbed, hideHidden);

				await interaction.update({ embeds: [featureEmbed] }).catch(() => undefined);
				return;
			} else {
				await interaction?.deferUpdate().catch(() => undefined);
				return;
			}
		});

		collector.on('end', async () => {
			await msg
				.edit({ components: [this.generateComponents(guildFeaturesArr, false, !message.author.isOwner())] })
				.catch(() => undefined);
		});
	}

	public generateDescription(
		allFeatures: GuildFeatures[],
		currentFeatures: GuildFeatures[],
		embed: EmbedBuilder,
		hide: boolean
	): void {
		embed.setDescription(
			allFeatures
				.filter((f) => !guildFeaturesObj[f].hidden || !hide)
				.map(
					(feature) => `${currentFeatures.includes(feature) ? emojis.check : emojis.cross} **${guildFeaturesObj[feature].name}**`
				)
				.join('\n')
		);
	}

	public generateComponents(guildFeatures: GuildFeatures[], disable: boolean, hide: boolean) {
		return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder({
				customId: 'command_selectFeature',
				disabled: disable,
				maxValues: 1,
				minValues: 1,
				options: guildFeatures
					.filter((f) => !guildFeaturesObj[f].hidden || !hide)
					.map((f) => ({
						label: guildFeaturesObj[f].name,
						value: f,
						description: guildFeaturesObj[f].description
					}))
			})
		);
	}
}
