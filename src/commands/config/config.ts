import {
	BotCommand,
	addOrRemoveFromArray,
	colors,
	emojis,
	formatList,
	guildSettingsObj,
	settingsArr,
	type ArgType,
	type CommandMessage,
	type GuildNoArraySetting,
	type GuildSettingType,
	type GuildSettings,
	type SlashMessage
} from '#lib';
import type { ArgumentGeneratorReturn, ExtSub, SlashOption } from '@tanzanite/discord-akairo';
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	BaseChannel,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	GuildMember,
	PermissionFlagsBits,
	Role,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	User,
	italic,
	type InteractionUpdateOptions,
	type Message,
	type MessageComponentInteraction,
	type MessageCreateOptions
} from 'discord.js';
import { camelCase, snakeCase } from 'lodash-es';
import assert from 'node:assert/strict';

export const arrayActions = ['view' as const, 'add' as const, 'remove' as const, 'clear' as const];
export type ArrayActions = (typeof arrayActions)[number];
export const actionsString = ['view' as const, 'set' as const, 'delete' as const];
export type ActionsString = (typeof actionsString)[number];
export const allActions = [...arrayActions, ...actionsString];
export type Action = (typeof allActions)[number];
type SlashArgType = 'ROLE' | 'STRING' | 'CHANNEL' | 'USER';
type BaseSettingTypes = 'string' | 'channel' | 'role' | 'user' | 'custom';

export default class ConfigCommand extends BotCommand {
	public constructor() {
		super('config', {
			aliases: ['config', 'settings', 'setting', 'configure'],
			category: 'config',
			description: 'Configure server settings.',
			usage: [`settings (${settingsArr.map((s) => `'${s}'`).join(', ')}) (${allActions.map((s) => `'${s}'`)})`],
			examples: ['settings', 'config prefix set -'],
			slash: true,
			slashOptions: settingsArr.map((setting): SlashOption => {
				const obj = guildSettingsObj[setting];
				const type = obj.type;
				const baseTypeUpper = type.replace('-array', '').toUpperCase() as SlashArgType;
				const isArray = type.includes('-array');
				const loweredName = obj.name.toLowerCase();

				const enumType =
					baseTypeUpper === 'CHANNEL'
						? ApplicationCommandOptionType.Channel
						: baseTypeUpper === 'ROLE'
							? ApplicationCommandOptionType.Role
							: baseTypeUpper === 'STRING'
								? ApplicationCommandOptionType.String
								: baseTypeUpper === 'USER'
									? ApplicationCommandOptionType.User
									: new Error(`Unknown type: ${type}`);
				if (enumType instanceof Error) throw enumType;

				return {
					name: snakeCase(setting),
					description: `Manage the server's ${loweredName}`,
					type: ApplicationCommandOptionType.SubcommandGroup,
					options: isArray
						? ([
								{
									name: 'view',
									description: `View the server's ${loweredName}.`,
									type: ApplicationCommandOptionType.Subcommand
								},
								{
									name: 'add',
									description: `Add a value to the server's ${loweredName}.`,
									type: ApplicationCommandOptionType.Subcommand,
									options: [
										{
											name: 'value',
											description: `What would you like to add to the server's ${loweredName}?'`,
											type: enumType,
											channelTypes: baseTypeUpper === 'CHANNEL' && obj.subType ? obj.subType : undefined,
											required: true
										}
									]
								},
								{
									name: 'remove',
									description: `Remove a value from the server's ${loweredName}.`,
									type: ApplicationCommandOptionType.Subcommand,
									options: [
										{
											name: 'value',
											description: `What would you like to remove from the server's ${loweredName}?'`,
											type: enumType,
											channelTypes: baseTypeUpper === 'CHANNEL' && obj.subType ? obj.subType : undefined,
											required: true
										}
									]
								},
								{
									name: 'clear',
									description: `Remove all values from a server's ${loweredName}.`,
									type: ApplicationCommandOptionType.Subcommand
								}
							] as ExtSub[])
						: ([
								{
									name: 'view',
									description: `View the server's ${loweredName}.`,
									type: ApplicationCommandOptionType.Subcommand
								},
								{
									name: 'set',
									description: `Set the server's ${loweredName}.`,
									type: ApplicationCommandOptionType.Subcommand,
									options: [
										{
											name: 'value',
											description: `What would you like to set the server's ${loweredName} to?'`,
											type: enumType,
											channelTypes: baseTypeUpper === 'CHANNEL' && obj.subType ? obj.subType : undefined,
											required: true
										}
									]
								},
								{
									name: 'delete',
									description: `Delete the server's ${loweredName}.`,
									type: ApplicationCommandOptionType.Subcommand
								}
							] as ExtSub[])
				};
			}),
			channel: 'guild',
			clientPermissions: [],
			userPermissions: ['ManageGuild']
		});
	}

	public override *args(message: CommandMessage): ArgumentGeneratorReturn {
		/* eslint-disable @typescript-eslint/no-unsafe-assignment */

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

		const actionType = setting ? (this.isArrayType(guildSettingsObj[setting].type) ? arrayActions : actionsString) : undefined;

		const action: Action = setting
			? yield {
					id: 'action',
					type: actionType!,
					prompt: {
						start: `Would you like to ${formatList(
							actionType!.map((a) => `\`${a}\``),
							'or'
						)} the \`${setting}\` setting?`,
						retry: `{error} Choose one of the following actions to perform on the ${setting} setting: ${formatList(
							actionType!.map((a) => `\`${a}\``),
							'or'
						)}`,
						optional
					}
				}
			: undefined;

		const valueType = setting && action && action !== 'view' ? this.baseType(guildSettingsObj[setting].type) : undefined;

		const grammar = this.grammar(action, setting);

		const value: typeof valueType =
			setting && action !== 'view'
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

		/* eslint-enable @typescript-eslint/no-unsafe-assignment */
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: {
			setting?: GuildSettings;
			subcommandGroup?: GuildSettings;
			action?: Action;
			subcommand?: Action;
			value: ArgType<'channel' | 'role'> | string;
		}
	) {
		assert(message.inGuild());
		assert(message.member);

		if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild) && !message.member?.user.isOwner())
			return await message.util.reply(`${emojis.error} You must have the **Manage Server** permission to run this command.`);
		const setting = message.util.isSlash ? (camelCase(args.subcommandGroup) as GuildSettings) : args.setting!;
		const action = message.util.isSlash ? args.subcommand! : args.action!;
		const value = args.value;

		let msg: Message;

		if (!setting || action === 'view') {
			const messageOptions = await this.generateMessageOptions(message, setting ?? undefined);
			msg = await message.util.reply(messageOptions);
		} else {
			const parseVal = (val: string | BaseChannel | Role | User | GuildMember) => {
				if (val instanceof BaseChannel || val instanceof Role || val instanceof User || val instanceof GuildMember) {
					return val.id;
				}
				return val;
			};

			if (!value && !(['clear', 'delete'] as const).includes(action))
				return await message.util.reply(`${emojis.error} You must choose a value to ${action} ${this.grammar(action, setting)}`);

			switch (action) {
				case 'add':
				case 'remove': {
					const existing = (await message.guild.getSetting(setting)) as string[];
					const updated = addOrRemoveFromArray(action, existing, parseVal(value));
					await message.guild.setSetting(setting, updated, message.member);
					const messageOptions = await this.generateMessageOptions(message, setting);
					msg = await message.util.reply(messageOptions);
					break;
				}
				case 'set': {
					await message.guild.setSetting(setting, parseVal(value), message.member);
					const messageOptions = await this.generateMessageOptions(message, setting);
					msg = await message.util.reply(messageOptions);
					break;
				}
				case 'clear': {
					await message.guild.setSetting(setting, [], message.member);
					const messageOptions = await this.generateMessageOptions(message, setting);
					msg = await message.util.reply(messageOptions);
					break;
				}
				case 'delete': {
					await message.guild.setSetting(setting, guildSettingsObj[setting].replaceNullWith(), message.member);
					const messageOptions = await this.generateMessageOptions(message, setting);
					msg = await message.util.reply(messageOptions);
					break;
				}
			}
		}

		const collector = msg.createMessageComponentCollector<ComponentType.StringSelect | ComponentType.Button>({
			time: 300_000,
			filter: (i) => i.guildId === msg.guildId && i.message?.id === msg.id
		});

		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		collector.on('collect', async (interaction: MessageComponentInteraction) => {
			if (interaction.user.id === message.author.id || this.client.config.owners.includes(interaction.user.id)) {
				assert(message.inGuild());

				switch (interaction.customId) {
					case 'command_settingsSel': {
						if (!interaction.isStringSelectMenu()) return;

						await interaction.update(
							await this.generateMessageOptions(message, interaction.values[0] as keyof typeof guildSettingsObj)
						);
						return;
					}
					case 'command_settingsBack': {
						if (!interaction.isButton()) return;

						await interaction.update(await this.generateMessageOptions(message));
						return;
					}
				}
			} else {
				await interaction?.deferUpdate().catch(() => undefined);
				return;
			}
		});
	}

	public async generateMessageOptions(
		message: CommandMessage | SlashMessage,
		setting?: keyof typeof guildSettingsObj
	): Promise<MessageCreateOptions & InteractionUpdateOptions> {
		assert(message.inGuild());

		const settingsEmbed = new EmbedBuilder().setColor(colors.default);
		if (!setting) {
			settingsEmbed.setTitle(`${message.guild.name}'s Settings`);
			const desc = settingsArr.map((s) => `:wrench: **${guildSettingsObj[s].name}**`).join('\n');
			settingsEmbed.setDescription(desc);

			const selMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				new StringSelectMenuBuilder()
					.addOptions(
						settingsArr.map((s) =>
							new StringSelectMenuOptionBuilder()
								.setLabel(guildSettingsObj[s].name)
								.setValue(s)
								.setDescription(guildSettingsObj[s].description)
						)
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
				const feat = await message.guild.getSetting(setting);

				/* eslint-disable @typescript-eslint/no-redundant-type-constituents, 
													@typescript-eslint/unbound-method, 
													@typescript-eslint/no-unsafe-return */
				const func = ((): ((v: string | any) => string) => {
					switch (type.replace('-array', '') as BaseSettingTypes) {
						case 'string':
							return (v) => this.client.utils.inspectAndRedact(v);
						case 'channel':
							return (v) => `<#${v}>`;
						case 'role':
							return (v) => `<@&${v}>`;
						case 'user':
							return (v) => `<@${v}>`;
						case 'custom':
							return this.client.utils.inspectAndRedact;
						default:
							return (v) => v;
					}
				})();

				return Array.isArray(feat)
					? feat.length
						? (<any[]>feat).map((v) => func(v)).join('\n')
						: '[Empty Array]'
					: feat !== null
						? func(feat)
						: '[No Value Set]';
			};

			const components = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder({ style: ButtonStyle.Primary, customId: 'command_settingsBack', label: 'Back' })
			);
			settingsEmbed.setDescription(
				`${italic(guildSettingsObj[setting].description)}\n\n**Type:** ${guildSettingsObj[setting].type}`
			);

			settingsEmbed.setFooter({
				text: `Run "${this.client.utils.prefix(message)}${message.util.parsed?.alias ?? 'config'} ${
					message.util.isSlash ? snakeCase(setting) : setting
				} ${guildSettingsObj[setting].type.includes('-array') ? 'add/remove' : 'set'} <value>" to set this setting.`
			});
			settingsEmbed.addFields({
				name: 'value',
				value: (await generateCurrentValue(guildSettingsObj[setting].type)) || '[No Value Set]'
			});
			return { embeds: [settingsEmbed], components: [components] };
		}
	}

	private isArrayType(type: GuildSettingType): boolean {
		return type.includes('-array');
	}

	private baseType(type: GuildSettingType): GuildNoArraySetting {
		return type.replace('-array', '') as GuildNoArraySetting;
	}

	private grammar(action: Action, setting: GuildSettings) {
		if (!setting || !action || action === 'view') return undefined;

		switch (action) {
			case 'add':
				return `to the ${setting} setting`;
			case 'remove':
				return `from the ${setting} setting`;
			case 'set':
				return `the ${setting} setting to`;
			case 'clear':
			case 'delete':
				return `the ${setting} setting`;
		}
	}
}
