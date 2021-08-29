import { BushCommand, BushMessage, BushSlashMessage, GuildSettings, guildSettingsObj, settingsArr } from '@lib';
import { ArgumentOptions, Flag } from 'discord-akairo';
import {
	Message,
	MessageActionRow,
	MessageButton,
	MessageComponentInteraction,
	MessageEmbed,
	MessageOptions,
	MessageSelectMenu
} from 'discord.js';
import _ from 'lodash';

export default class SettingsCommand extends BushCommand {
	public constructor() {
		super('settings', {
			aliases: ['settings', 'setting', 'configure', 'config'],
			category: 'config',
			description: {
				content: 'Configure server options.',
				usage: `settings (${settingsArr.map((s) => `\`${s}\``).join(', ')}) (${['view', 'set', 'add', 'remove'].map(
					(s) => `\`${s}\``
				)})`,
				examples: ['settings']
			},
			slash: true,
			slashOptions: settingsArr.map((setting) => {
				return {
					name: _.snakeCase(setting),
					description: `Manage the server's ${guildSettingsObj[setting].name.toLowerCase()}`,
					type: 'SUB_COMMAND_GROUP',
					options: guildSettingsObj[setting].type.includes('-array')
						? [
								{
									name: 'view',
									description: `View the server's ${guildSettingsObj[setting].name.toLowerCase()}.`,
									type: 'SUB_COMMAND'
								},
								{
									name: 'add',
									description: `Add a value to the server's ${guildSettingsObj[setting].name.toLowerCase()}.`,
									type: 'SUB_COMMAND',
									options: [
										{
											name: 'value',
											description: `What would you like to add to the server's ${guildSettingsObj[
												setting
											].name.toLowerCase()}?'`,
											type: guildSettingsObj[setting].type.replace('-array', '').toUpperCase() as 'ROLE' | 'STRING' | 'CHANNEL',
											required: true
										}
									]
								},
								{
									name: 'remove',
									description: `Remove a value from the server's ${guildSettingsObj[setting].name.toLowerCase()}.`,
									type: 'SUB_COMMAND',
									options: [
										{
											name: 'value',
											description: `What would you like to remove from the server's ${guildSettingsObj[
												setting
											].name.toLowerCase()}?'`,
											type: guildSettingsObj[setting].type.replace('-array', '').toUpperCase() as 'ROLE' | 'STRING' | 'CHANNEL',
											required: true
										}
									]
								}
						  ]
						: [
								{
									name: 'view',
									description: `View the server's ${guildSettingsObj[setting].name.toLowerCase()}.`,
									type: 'SUB_COMMAND'
								},
								{
									name: 'set',
									description: `Set the server's ${guildSettingsObj[setting].name.toLowerCase()}.`,
									type: 'SUB_COMMAND',
									options: [
										{
											name: 'value',
											description: `What would you like to set the server's ${guildSettingsObj[
												setting
											].name.toLowerCase()} to?'`,
											type: guildSettingsObj[setting].type.toUpperCase() as 'ROLE' | 'STRING' | 'CHANNEL',
											required: true
										}
									]
								}
						  ]
				};
			}),
			slashGuilds: ['516977525906341928', '812400566235430912'],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD'],
			ownerOnly: true
		});
	}

	// I make very readable code :)
	*args(message: BushMessage): IterableIterator<ArgumentOptions | Flag> {
		const setting = yield {
			id: 'setting',
			type: settingsArr,
			prompt: {
				start: `What setting would you like to see or change? You can choose one of the following: ${settingsArr
					.map((s) => `\`${s}\``)
					.join(', ')}`,
				retry: `{error} Choose one of the following settings: ${settingsArr.map((s) => `\`${s}\``).join(', ')}`,
				optional: message.util.parsed!.alias === 'settings'
			}
		};

		const action = yield {
			id: 'action',
			type: guildSettingsObj[setting as unknown as GuildSettings].type.includes('-array')
				? ['view', 'add', 'remove']
				: ['view', 'set'],
			prompt: {
				start: `Would you like to ${util.oxford(
					(guildSettingsObj[setting as unknown as GuildSettings].type.includes('-array')
						? ['view', 'add', 'remove']
						: ['view', 'set']
					).map((a) => `\`${a}\``),
					'or'
				)} the \`${setting}\` setting?`,
				retry: `{error} Choose one of the following actions to perform on the \`${setting}\` setting: ${util.oxford(
					(guildSettingsObj[setting as unknown as GuildSettings].type.includes('-array')
						? ['view', 'add', 'remove']
						: ['view', 'set']
					).map((a) => `\`${a}\``),
					'or'
				)}`,
				optional: message.util.parsed!.alias === 'settings'
			}
		};

		const value =
			action === 'view'
				? undefined
				: yield {
						id: 'value',
						type: 'string',
						match: 'restContent',
						prompt: {
							start: `What would you like to ${action} ${
								(action as unknown as 'add' | 'remove' | 'set') === 'add'
									? `to the ${setting} setting`
									: (action as unknown as 'remove' | 'set') === 'remove'
									? `from the ${setting} setting`
									: `the ${setting} setting to`
							}?`,
							retry: `{error} You must choose a value to ${action} ${
								(action as unknown as 'add' | 'remove' | 'set') === 'add'
									? `to the ${setting} setting`
									: (action as unknown as 'remove' | 'set') === 'remove'
									? `from the ${setting} setting`
									: `the ${setting} setting to`
							}.`,
							optional: message.util.parsed!.alias === 'settings'
						}
				  };

		return { setting, action, value };
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { [x in GuildSettings | ('view' | 'set' | 'add' | 'remove') | ('setting' | 'action') | 'value']: string | undefined }
	): Promise<unknown> {
		if (!message.guild) return await message.util.reply(`${util.emojis.error} This command can only be used in servers.`);
		if (!message.member?.permissions.has('MANAGE_GUILD'))
			return await message.util.reply(
				`${util.emojis.error} You must have the **MANAGE_GUILD** permissions to run this command.`
			);
		const setting = _.camelCase(args[settingsArr.find((s) => args[s]) ?? 'setting']) as GuildSettings | undefined;
		const action = (args[
			(['view', 'set', 'add', 'remove'] as ('view' | 'set' | 'add' | 'remove')[]).find((a) => args[a]) ?? 'action'
		] ?? 'view') as 'view' | 'set' | 'add' | 'remove';
		const value = args.value;

		let msg;

		if (!setting || action === 'view') {
			const messageOptions = await this.generateMessageOptions(message, setting ?? undefined);
			msg = (await message.util.reply(messageOptions)) as Message;
		} else {
			if (!value)
				return await message.util.reply(
					`${util.emojis.error} You must choose a value to ${action} ${
						(action as unknown as 'add' | 'remove' | 'set') === 'add'
							? `to the ${setting} setting`
							: (action as unknown as 'remove' | 'set') === 'remove'
							? `from the ${setting} setting`
							: `the ${setting} setting to`
					}`
				);
			switch (action) {
				case 'add':
				case 'remove': {
					const existing = (await message.guild.getSetting(setting)) as string[];
					const updated = util.addOrRemoveFromArray('add', existing, value);
					await message.guild.setSetting(setting, updated);
					const messageOptions = await this.generateMessageOptions(message);
					msg = (await message.util.reply(messageOptions)) as Message;
					break;
				}
				case 'set': {
					await message.guild.setSetting(setting, value);
					const messageOptions = await this.generateMessageOptions(message);
					msg = (await message.util.reply(messageOptions)) as Message;
					break;
				}
			}
		}
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
					case 'command_settingsBack': {
						if (!interaction.isButton()) return;

						return interaction.update(await this.generateMessageOptions(message));
					}
				}
			} else {
				return await interaction?.deferUpdate().catch(() => undefined);
			}
		});
	}

	public async generateMessageOptions(
		message: BushMessage | BushSlashMessage,
		feature?: undefined | keyof typeof guildSettingsObj
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
			const generateCurrentValue = async (
				type: 'string' | 'channel' | 'channel-array' | 'role' | 'role-array'
			): Promise<string> => {
				const feat = await message.guild!.getSetting(feature);
				console.debug(feat);
				switch (type.replace('-array', '') as 'string' | 'channel' | 'role') {
					case 'string': {
						return Array.isArray(feat)
							? feat.map((feat) => util.discord.escapeInlineCode(util.inspectAndRedact(feat))).join('\n')
							: util.discord.escapeInlineCode(util.inspectAndRedact(feat));
					}
					case 'channel': {
						return Array.isArray(feat) ? feat.map((feat) => `<#${feat}>`).join('\n') : `<#${feat}>`;
					}
					case 'role': {
						return Array.isArray(feat) ? feat.map((feat) => `<@&${feat}>`).join('\n') : `<@&${feat}>`;
					}
				}
			};

			const components = new MessageActionRow().addComponents(
				new MessageButton().setStyle('PRIMARY').setCustomId('command_settingsBack').setLabel('Back')
			);
			settingsEmbed.setDescription(guildSettingsObj[feature].description);

			settingsEmbed.setFooter(
				`Run "${message.util.isSlash ? '/' : await message.guild.getSetting('prefix')}settings ${feature} ${
					guildSettingsObj[feature].type.includes('-array') ? 'add/remove' : 'set'
				} <value>" to set this setting.`
			);
			settingsEmbed.addField(
				guildSettingsObj[feature].name,
				(await generateCurrentValue(feature as 'string' | 'channel' | 'channel-array' | 'role' | 'role-array')) ||
					'[No Value Set]'
			);
			return { embeds: [settingsEmbed], components: [components] };
		}
	}
}
