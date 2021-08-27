import { BushCommand, BushMessage, BushSlashMessage, guildSettings } from '@lib';
import {
	Message,
	MessageActionRow,
	MessageButton,
	MessageComponentInteraction,
	MessageEmbed,
	MessageOptions,
	MessageSelectMenu
} from 'discord.js';

export default class SettingsCommand extends BushCommand {
	public constructor() {
		super('settings', {
			aliases: ['settings', 'setting', 'configure', 'config'],
			category: 'config',
			description: {
				content: 'Configure server options.',
				usage: 'settings',
				examples: ['settings']
			},
			slash: true,
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD'],
			ownerOnly: true
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage): Promise<unknown> {
		if (!message.guild) return await message.util.reply(`${util.emojis.error} This command can only be used in servers.`);
		const messageOptions = await this.generateMessageOptions(message);
		const msg = (await message.util.reply(messageOptions)) as Message;
		const collector = msg.createMessageComponentCollector({
			channel: message.channel ?? undefined,
			guild: message.guild,
			message: message as Message,
			time: 300_000
		});

		collector.on('collect', async (interaction: MessageComponentInteraction) => {
			if (interaction.user.id === message.author.id || client.config.owners.includes(interaction.user.id)) {
				if (!message.guild) throw new Error('message.guild is null');
				switch (interaction.customId) {
					case 'command_settingsSel': {
						if (!interaction.isSelectMenu()) return;

						return interaction.update(
							await this.generateMessageOptions(message, interaction.values[0] as keyof typeof guildSettings)
						);
					}
				}
			} else {
				return await interaction?.deferUpdate().catch(() => undefined);
			}
		});
	}

	public async generateMessageOptions(
		message: BushMessage | BushSlashMessage,
		feature?: keyof typeof guildSettings
	): Promise<MessageOptions> {
		if (!message.guild) throw new Error('message.guild is null');
		const settingsEmbed = new MessageEmbed().setTitle(`${message.guild!.name}'s Settings`).setColor(util.colors.default);
		if (!feature) {
			const settingsArr = Object.keys(guildSettings) as (keyof typeof guildSettings)[];
			const desc = settingsArr.map((s) => `**${guildSettings[s].name}**`).join('\n');
			settingsEmbed.setDescription(desc);

			const selMenu = new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.addOptions(
						...settingsArr.map((s) => ({
							label: guildSettings[s].name,
							value: s,
							description: guildSettings[s].description
						}))
					)
					.setPlaceholder('Select A Setting to View')
					.setMaxValues(1)
					.setMinValues(1)
					.setCustomId('command_settingsSel')
			);
			return { embeds: [settingsEmbed], components: [selMenu] };
		} else {
			const components = new MessageActionRow().addComponents(
				new MessageButton().setStyle('PRIMARY').setCustomId('command_settingsBack').setLabel('Back')
			);
			settingsEmbed.setDescription(guildSettings[feature].description);
			switch (guildSettings[feature].type as 'string' | 'channel' | 'channel-array' | 'role' | 'role-array') {
				case 'string': {
					settingsEmbed.addField(guildSettings[feature].name, (await message.guild.getSetting(feature)).toString());
					settingsEmbed.setFooter(
						`Run "${await message.guild.getSetting('prefix')}settings set ${feature} <value>" to set this setting.`
					);
					return { embeds: [settingsEmbed], components: [components] };
				}
				case 'channel': {
					break;
				}
				case 'channel-array': {
					break;
				}
				case 'role': {
					break;
				}
				case 'role-array': {
					break;
				}
			}
			return {};
		}
	}
}
