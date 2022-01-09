import {
	BushCommand,
	guildSettingsObj,
	settingsArr,
	type ArgType,
	type BushMessage,
	type BushSlashMessage,
	type GuildSettings,
	type GuildSettingType
} from '#lib';
import assert from 'assert';
import { type ArgumentOptions, type Flag } from 'discord-akairo';
import {
	Channel,
	Formatters,
	GuildMember,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	MessageSelectMenu,
	Role,
	User,
	type Message,
	type MessageComponentInteraction,
	type MessageOptions
} from 'discord.js';
import _ from 'lodash';

export default class ConfigCommand extends BushCommand {
	public constructor() {
		super('config', {
			aliases: ['config', 'settings', 'setting', 'configure'],
			category: 'config',
			description: 'Configure server settings.',
			usage: [
				`settings (${settingsArr.map((s) => `'${s}'`).join(', ')}) (${['view', 'set', 'add', 'remove'].map((s) => `'${s}'`)})`
			],
			examples: ['settings', 'config prefix set -'],
			slash: true,
			slashOptions: settingsArr.map((setting) => {
				const obj = guildSettingsObj[setting];
				const type = obj.type;
				const baseTypeUpper = type.replace('-array', '').toUpperCase() as SlashArgType;
				const isArray = type.includes('-array');
				const loweredName = obj.name.toLowerCase();

				return {
					name: _.snakeCase(setting),
					description: `Manage the server's ${loweredName}`,
					type: 'SUB_COMMAND_GROUP',
					options: isArray
						? [
								{
									name: 'view',
									description: `View the server's ${loweredName}.`,
									type: 'SUB_COMMAND'
								},
								{
									name: 'add',
									description: `Add a value to the server's ${loweredName}.`,
									type: 'SUB_COMMAND',
									options: [
										{
											name: 'value',
											description: `What would you like to add to the server's ${loweredName}?'`,
											type: baseTypeUpper,
											channelTypes: baseTypeUpper === 'CHANNEL' && obj.subType ? obj.subType : undefined,
											required: true
										}
									]
								},
								{
									name: 'remove',
									description: `Remove a value from the server's ${loweredName}.`,
									type: 'SUB_COMMAND',
									options: [
										{
											name: 'value',
											description: `What would you like to remove from the server's ${loweredName}?'`,
											type: baseTypeUpper,
											channelTypes: baseTypeUpper === 'CHANNEL' && obj.subType ? obj.subType : undefined,
											required: true
										}
									]
								}
						  ]
						: [
								{
									name: 'view',
									description: `View the server's ${loweredName}.`,
									type: 'SUB_COMMAND'
								},
								{
									name: 'set',
									description: `Set the server's ${loweredName}.`,
									type: 'SUB_COMMAND',
									options: [
										{
											name: 'value',
											description: `What would you like to set the server's ${loweredName} to?'`,
											type: baseTypeUpper,
											channelTypes: baseTypeUpper === 'CHANNEL' && obj.subType ? obj.subType : undefined,
											required: true
										}
									]
								}
						  ]
				};
			}),
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: ['MANAGE_GUILD']
		});
	}

	public override *args(message: BushMessage): Generator<ArgumentOptions | Flag, any, any> {
		const optional = message.util.parsed!.alias === 'settings';
		const setting: GuildSettings = yield {
			id: 'setting',
			type: settingsArr,
			prompt: {
				start: `What setting would you like to see or change? You can choose one of the following: ${settingsArr
					.map((s) => `\`${s}\``)
					.join(', ')}`,
				retry: `{error} Choose one of the following settings: ${settingsArr.map((s) => `\`${s}\``).join(', ')}`,
				optional
			}
		};

		const actionType = setting
			? guildSettingsObj[setting as GuildSettings]?.type.includes('-array')
				? ['view', 'add', 'remove']
				: ['view', 'set']
			: undefined;

		const action: string = setting
			? yield {
					id: 'action',
					type: actionType,
					prompt: {
						start: `Would you like to ${util.oxford(
							actionType!.map((a) => `\`${a}\``),
							'or'
						)} the \`${setting}\` setting?`,
						retry: `{error} Choose one of the following actions to perform on the ${setting} setting: ${util.oxford(
							actionType!.map((a) => `\`${a}\``),
							'or'
						)}`,
						optional
					}
			  }
			: undefined;

		const valueType =
			setting && action && action !== 'view'
				? (guildSettingsObj[setting as GuildSettings].type.replace('-array', '') as 'string' | 'channel' | 'role')
				: undefined;
		const grammar =
			setting && action && action !== 'view'
				? (action as 'add' | 'remove' | 'set') === 'add'
					? `to the ${setting} setting`
					: (action as 'remove' | 'set') === 'remove'
					? `from the ${setting} setting`
					: `the ${setting} setting to`
				: undefined;

		const value: typeof valueType =
			setting && action && action !== 'view'
				? yield {
						id: 'value',
						type: valueType,
						match: 'restContent',
						prompt: {
							start: `What would you like to ${action} ${grammar}?`,
							retry: `{error} You must choose a ${valueType === 'string' ? 'value' : valueType} to ${action} ${grammar}.`,
							optional
						}
				  }
				: undefined;

		return { setting, action, value };
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: {
			setting?: GuildSettings;
			subcommandGroup?: GuildSettings;
			action?: Action;
			subcommand?: Action;
			value: ArgType<'channel'> | ArgType<'role'> | string;
		}
	) {
		if (!message.guild) return await message.util.reply(`${util.emojis.error} This command can only be used in servers.`);
		if (!message.member?.permissions.has('MANAGE_GUILD') && !message.member?.user.isOwner())
			return await message.util.reply(`${util.emojis.error} You must have the **MANAGE_GUILD** permission to run this command.`);
		const setting = message.util.isSlash ? (_.camelCase(args.subcommandGroup)! as GuildSettings) : args.setting!;
		const action = message.util.isSlash ? args.subcommand! : args.action!;
		const value = args.value;

		let msg: Message;

		if (!setting || action === 'view') {
			const messageOptions = await this.generateMessageOptions(message, setting ?? undefined);
			msg = (await message.util.reply(messageOptions)) as Message;
		} else {
			const parseVal = (val: string | Channel | Role | User | GuildMember) => {
				if (val instanceof Channel || val instanceof Role || val instanceof User || val instanceof GuildMember) {
					return val.id;
				}
				return val;
			};

			if (!value)
				return await message.util.reply(
					`${util.emojis.error} You must choose a value to ${action} ${
						action === 'add'
							? `to the ${setting} setting`
							: action === 'remove'
							? `from the ${setting} setting`
							: `the ${setting} setting to`
					}`
				);
			switch (action) {
				case 'add':
				case 'remove': {
					const existing = (await message.guild.getSetting(setting)) as string[];
					const updated = util.addOrRemoveFromArray(action, existing, parseVal(value));
					await message.guild.setSetting(setting, updated, message.member);
					const messageOptions = await this.generateMessageOptions(message, setting);
					msg = (await message.util.reply(messageOptions)) as Message;
					break;
				}
				case 'set': {
					await message.guild.setSetting(setting, parseVal(value), message.member);
					const messageOptions = await this.generateMessageOptions(message, setting);
					msg = (await message.util.reply(messageOptions)) as Message;
					break;
				}
			}
		}
		const collector = msg.createMessageComponentCollector({
			time: 300_000,
			filter: (i) => i.guildId === msg.guildId && i.message?.id === msg.id
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
		setting?: undefined | keyof typeof guildSettingsObj
	): Promise<MessageOptions> {
		if (!message.guild) throw new Error('message.guild is null');
		const settingsEmbed = new MessageEmbed().setColor(util.colors.default);
		if (!setting) {
			settingsEmbed.setTitle(`${message.guild!.name}'s Settings`);
			const desc = settingsArr.map((s) => `:wrench: **${guildSettingsObj[s].name}**`).join('\n');
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
			settingsEmbed.setTitle(guildSettingsObj[setting].name);
			const generateCurrentValue = async (type: GuildSettingType): Promise<string> => {
				const feat = await message.guild!.getSetting(setting);
				let func = (v: string) => v;
				switch (type.replace('-array', '') as BaseSettingTypes) {
					case 'string': {
						func = (v: string) => util.inspectAndRedact(v);
						break;
					}
					case 'channel': {
						func = (v: string) => `<#${v}>`;
						break;
					}
					case 'role': {
						func = (v: string) => `<@&${v}>`;
						break;
					}
					case 'user': {
						func = (v: string) => `<@${v}>`;
						break;
					}
					case 'custom': {
						return util.inspectAndRedact(feat);
					}
				}

				assert(typeof feat === 'string' || Array.isArray(feat), `feat is not a string: ${util.inspect(feat)}`);

				return Array.isArray(feat)
					? feat.length
						? (<string[]>feat).map(func).join('\n')
						: '[Empty Array]'
					: feat !== null
					? func(feat)
					: '[No Value Set]';
			};

			const components = new MessageActionRow().addComponents(
				new MessageButton().setStyle('PRIMARY').setCustomId('command_settingsBack').setLabel('Back')
			);
			settingsEmbed.setDescription(
				`${Formatters.italic(guildSettingsObj[setting].description)}\n\n**Type**: ${guildSettingsObj[setting].type}`
			);

			settingsEmbed.setFooter({
				text: `Run "${util.prefix(message)}${message.util.parsed?.alias ?? 'config'} ${
					message.util.isSlash ? _.snakeCase(setting) : setting
				} ${guildSettingsObj[setting].type.includes('-array') ? 'add/remove' : 'set'} <value>" to set this setting.`
			});
			settingsEmbed.addField('value', (await generateCurrentValue(guildSettingsObj[setting].type)) || '[No Value Set]');
			return { embeds: [settingsEmbed], components: [components] };
		}
	}
}

type SlashArgType = 'ROLE' | 'STRING' | 'CHANNEL' | 'USER';
type BaseSettingTypes = 'string' | 'channel' | 'role' | 'user' | 'custom';
type Action = 'view' | 'add' | 'remove' | 'set';
