import {
	BushCommand,
	guildFeaturesArr,
	guildFeaturesObj,
	type BushMessage,
	type BushSlashMessage,
	type GuildFeatures
} from '#lib';
import {
	ActionRow,
	ComponentType,
	Embed,
	PermissionFlagsBits,
	SelectMenuComponent,
	SelectMenuOption,
	type Message,
	type SelectMenuInteraction
} from 'discord.js';

export default class FeaturesCommand extends BushCommand {
	public constructor() {
		super('features', {
			aliases: ['features'],
			category: 'config',
			description: 'Toggle features the server.',
			usage: ['features'],
			examples: ['features'],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: [PermissionFlagsBits.ManageGuild]
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage) {
		if (!message.guild) return await message.util.reply(`${util.emojis.error} This command can only be used in servers.`);

		const featureEmbed = new Embed().setTitle(`${message.guild!.name}'s Features`).setColor(util.colors.default);

		const enabledFeatures = await message.guild!.getSetting('enabledFeatures');
		this.generateDescription(guildFeaturesArr, enabledFeatures, featureEmbed);
		const components = this.generateComponents(guildFeaturesArr, false);
		const msg = (await message.util.reply({ embeds: [featureEmbed], components: [components] })) as Message;
		const collector = msg.createMessageComponentCollector({
			componentType: ComponentType.SelectMenu,
			time: 300_000,
			filter: (i) => i.guildId === msg.guildId && i.message?.id === msg.id
		});

		collector.on('collect', async (interaction: SelectMenuInteraction) => {
			if (interaction.user.id === message.author.id || client.config.owners.includes(interaction.user.id)) {
				if (!message.guild) throw new Error('message.guild is null');

				const [selected]: GuildFeatures[] = interaction.values as GuildFeatures[];

				if (!guildFeaturesArr.includes(selected)) throw new Error('Invalid guild feature selected');

				const newEnabledFeatures = await message.guild.toggleFeature(selected, message.member!);

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

	public generateDescription(allFeatures: GuildFeatures[], currentFeatures: GuildFeatures[], embed: Embed): void {
		embed.setDescription(
			allFeatures
				.map(
					(feature) =>
						`${currentFeatures.includes(feature) ? util.emojis.check : util.emojis.cross} **${guildFeaturesObj[feature].name}**`
				)
				.join('\n')
		);
	}

	public generateComponents(guildFeatures: GuildFeatures[], disable: boolean) {
		return new ActionRow().addComponents(
			new SelectMenuComponent()
				.setCustomId('command_selectFeature')
				.setDisabled(disable)
				.setMaxValues(1)
				.setMinValues(1)
				.setOptions(
					...guildFeatures.map((f) =>
						new SelectMenuOption().setLabel(guildFeaturesObj[f].name).setValue(f).setDescription(guildFeaturesObj[f].description)
					)
				)
		);
	}
}
