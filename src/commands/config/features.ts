import {
	BushCommand,
	clientSendAndPermCheck,
	colors,
	emojis,
	guildFeaturesArr,
	guildFeaturesObj,
	type CommandMessage,
	type GuildFeatures,
	type SlashMessage
} from '#lib';
import assert from 'assert';
import {
	ActionRowBuilder,
	ComponentType,
	EmbedBuilder,
	PermissionFlagsBits,
	SelectMenuBuilder,
	type Message,
	type SelectMenuInteraction
} from 'discord.js';

export default class FeaturesCommand extends BushCommand {
	public constructor() {
		super('features', {
			aliases: ['features'],
			category: 'config',
			description: 'Toggle the features of the server.',
			usage: ['features'],
			examples: ['features'],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: [PermissionFlagsBits.ManageGuild]
		});
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		assert(message.inGuild());

		const featureEmbed = new EmbedBuilder().setTitle(`${message.guild.name}'s Features`).setColor(colors.default);

		const enabledFeatures = await message.guild.getSetting('enabledFeatures');
		this.generateDescription(guildFeaturesArr, enabledFeatures, featureEmbed);
		const components = this.generateComponents(guildFeaturesArr, false);
		const msg = (await message.util.reply({ embeds: [featureEmbed], components: [components] })) as Message;
		const collector = msg.createMessageComponentCollector({
			componentType: ComponentType.SelectMenu,
			time: 300_000,
			filter: (i) => i.guildId === msg.guildId && i.message?.id === msg.id
		});

		collector.on('collect', async (interaction: SelectMenuInteraction) => {
			if (interaction.user.id === message.author.id || this.client.config.owners.includes(interaction.user.id)) {
				assert(message.inGuild());

				const [selected]: GuildFeatures[] = interaction.values as GuildFeatures[];

				if (!guildFeaturesArr.includes(selected)) throw new Error('Invalid guild feature selected');

				const newEnabledFeatures = await message.guild.toggleFeature(selected, message.member!);

				this.generateDescription(guildFeaturesArr, newEnabledFeatures, featureEmbed);

				await interaction.update({ embeds: [featureEmbed] }).catch(() => undefined);
				return;
			} else {
				await interaction?.deferUpdate().catch(() => undefined);
				return;
			}
		});

		collector.on('end', async () => {
			await msg.edit({ components: [this.generateComponents(guildFeaturesArr, false)] }).catch(() => undefined);
		});
	}

	public generateDescription(allFeatures: GuildFeatures[], currentFeatures: GuildFeatures[], embed: EmbedBuilder): void {
		embed.setDescription(
			allFeatures
				.map(
					(feature) => `${currentFeatures.includes(feature) ? emojis.check : emojis.cross} **${guildFeaturesObj[feature].name}**`
				)
				.join('\n')
		);
	}

	public generateComponents(guildFeatures: GuildFeatures[], disable: boolean) {
		return new ActionRowBuilder<SelectMenuBuilder>().addComponents([
			new SelectMenuBuilder({
				customId: 'command_selectFeature',
				disabled: disable,
				maxValues: 1,
				minValues: 1,
				options: guildFeatures
					.filter((f) => !guildFeaturesObj[f].hidden)
					.map((f) => ({
						label: guildFeaturesObj[f].name,
						value: f,
						description: guildFeaturesObj[f].description
					}))
			})
		]);
	}
}
