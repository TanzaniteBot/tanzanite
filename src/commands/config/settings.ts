import { BushCommand, BushMessage, BushSlashMessage, guildSettingsObj, settingsArr } from '@lib';
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
			slashOptions: [
				{
					name: 'view',
					description: 'See a all settings or a particular setting',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'setting',
							description: 'What setting would you like to see?',
							type: 'STRING',
							required: false,
							choices: settingsArr.map((s) => ({ name: guildSettingsObj[s].name, value: s }))
						}
					]
				},
				{
					name: 'set',
					description: 'Set a particular setting.',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'setting',
							description: 'What setting would you like to set?',
							type: 'STRING',
							required: true,
							choices: settingsArr
								.filter((s) => !guildSettingsObj[s].type.includes('array'))
								.map((s) => ({ name: guildSettingsObj[s].name, value: s }))
						},
						{
							name: 'value',
							description: 'What would you like the new value to be?',
							type: 'STRING',
							required: true
						}
					]
				},
				{
					name: 'add',
					description: 'Add a value to a particular setting.',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'setting',
							description: 'What setting would you like to add to?',
							type: 'STRING',
							required: true,
							choices: settingsArr
								.filter((s) => guildSettingsObj[s].type.includes('array'))
								.map((s) => ({ name: guildSettingsObj[s].name, value: s }))
						},
						{
							name: 'value',
							description: 'What would you like the new value to be?',
							type: 'STRING',
							required: true
						}
					]
				},
				{
					name: 'remove',
					description: 'Remove a value to a particular setting.',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'setting',
							description: 'What setting would you like to set?',
							type: 'STRING',
							required: true,
							choices: settingsArr
								.filter((s) => guildSettingsObj[s].type.includes('array'))
								.map((s) => ({ name: guildSettingsObj[s].name, value: s }))
						},
						{
							name: 'value',
							description: 'What would you like the new value to be?',
							type: 'STRING',
							required: true
						}
					]
				}
			],
			slashGuilds: ['516977525906341928'],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD'],
			ownerOnly: true
		});
	}

	// *args(): any {}

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
							await this.generateMessageOptions(message, interaction.values[0] as keyof typeof guildSettingsObj)
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
		feature?: keyof typeof guildSettingsObj
	): Promise<MessageOptions> {
		if (!message.guild) throw new Error('message.guild is null');
		const settingsEmbed = new MessageEmbed().setTitle(`${message.guild!.name}'s Settings`).setColor(util.colors.default);
		if (!feature) {
			const desc = settingsArr.map((s) => `**${guildSettingsObj[s].name}**`).join('\n');
			settingsEmbed.setDescription(desc);

			const selMenu = new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.addOptions(
						...settingsArr.map((s) => ({
							label: guildSettingsObj[s].name,
							value: s,
							description: guildSettingsObj[s].description
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
			settingsEmbed.setDescription(guildSettingsObj[feature].description);
			switch (guildSettingsObj[feature].type as 'string' | 'channel' | 'channel-array' | 'role' | 'role-array') {
				case 'string': {
					settingsEmbed.addField(guildSettingsObj[feature].name, (await message.guild.getSetting(feature)).toString());
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
