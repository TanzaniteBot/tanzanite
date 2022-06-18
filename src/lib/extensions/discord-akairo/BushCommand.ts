import { type DiscordEmojiInfo, type RoleWithDuration } from '#args';
import {
	type BushArgumentTypeCaster,
	type BushClient,
	type BushCommandHandler,
	type BushInhibitor,
	type BushListener,
	type BushTask,
	type ParsedDuration
} from '#lib';
import {
	ArgumentMatch,
	Command,
	CommandUtil,
	type AkairoApplicationCommandAutocompleteOption,
	type AkairoApplicationCommandChannelOptionData,
	type AkairoApplicationCommandChoicesData,
	type AkairoApplicationCommandNonOptionsData,
	type AkairoApplicationCommandNumericOptionData,
	type AkairoApplicationCommandOptionData,
	type AkairoApplicationCommandSubCommandData,
	type AkairoApplicationCommandSubGroupData,
	type ArgumentOptions,
	type ArgumentType,
	type ArgumentTypeCaster,
	type BaseArgumentType,
	type CommandOptions,
	type ContextMenuCommand,
	type MissingPermissionSupplier,
	type SlashOption,
	type SlashResolveType
} from 'discord-akairo';
import {
	Message,
	User,
	type ApplicationCommandOptionChoiceData,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type ApplicationCommandOptionType,
	type PermissionResolvable,
	type PermissionsString,
	type Snowflake
} from 'discord.js';
import _ from 'lodash';
import { SlashMessage } from './SlashMessage.js';

export interface OverriddenBaseArgumentType extends BaseArgumentType {
	commandAlias: BushCommand | null;
	command: BushCommand | null;
	inhibitor: BushInhibitor | null;
	listener: BushListener | null;
	task: BushTask | null;
	contextMenuCommand: ContextMenuCommand | null;
}

export interface BaseBushArgumentType extends OverriddenBaseArgumentType {
	duration: number | null;
	contentWithDuration: ParsedDuration;
	permission: PermissionsString | null;
	snowflake: Snowflake | null;
	discordEmoji: DiscordEmojiInfo | null;
	roleWithDuration: RoleWithDuration | null;
	abbreviatedNumber: number | null;
	globalUser: User | null;
	messageLink: Message | null;
	durationSeconds: number | null;
	tinyColor: string | null;
}

export type BushArgumentType = keyof BaseBushArgumentType | RegExp;

interface BaseBushArgumentOptions extends Omit<ArgumentOptions, 'type' | 'prompt'>, ExtraArgumentOptions {
	id: string;
	description: string;

	/**
	 * The message sent for the prompt and the slash command description.
	 */
	prompt?: string;

	/**
	 * The message set for the retry prompt.
	 */
	retry?: string;

	/**
	 * Whether or not the argument is optional.
	 */
	optional?: boolean;

	/**
	 * The type used for slash commands. Set to false to disable this argument for slash commands.
	 */
	slashType: AkairoApplicationCommandOptionData['type'] | false;

	/**
	 * Allows you to get a discord resolved object
	 *
	 * ex. get the resolved member object when the type is {@link ApplicationCommandOptionType.User User}
	 */
	slashResolve?: SlashResolveType;

	/**
	 * The choices of the option for the user to pick from
	 */
	choices?: ApplicationCommandOptionChoiceData[];

	/**
	 * Whether the option is an autocomplete option
	 */
	autocomplete?: boolean;

	/**
	 * When the option type is channel, the allowed types of channels that can be selected
	 */
	channelTypes?: AkairoApplicationCommandChannelOptionData['channelTypes'];

	/**
	 * The minimum value for an {@link ApplicationCommandOptionType.Integer Integer} or {@link ApplicationCommandOptionType.Number Number} option
	 */
	minValue?: number;

	/**
	 * The maximum value for an {@link ApplicationCommandOptionType.Integer Integer} or {@link ApplicationCommandOptionType.Number Number} option
	 */
	maxValue?: number;
}

interface ExtraArgumentOptions {
	/**
	 * Restrict this argument to only slash or only text commands.
	 */
	only?: 'slash' | 'text';

	/**
	 * Readable type for the help command.
	 */
	readableType?: string;

	/**
	 * Whether the argument is only accessible to the owners.
	 * @default false
	 */
	ownerOnly?: boolean;

	/**
	 * Whether the argument is only accessible to the super users.
	 * @default false
	 */
	superUserOnly?: boolean;
}

export interface BushArgumentOptions extends BaseBushArgumentOptions {
	/**
	 * The type that the argument should be cast to.
	 * - `string` does not cast to any type.
	 * - `lowercase` makes the input lowercase.
	 * - `uppercase` makes the input uppercase.
	 * - `charCodes` transforms the input to an array of char codes.
	 * - `number` casts to a number.
	 * - `integer` casts to an integer.
	 * - `bigint` casts to a big integer.
	 * - `url` casts to an `URL` object.
	 * - `date` casts to a `Date` object.
	 * - `color` casts a hex code to an integer.
	 * - `commandAlias` tries to resolve to a command from an alias.
	 * - `command` matches the ID of a command.
	 * - `inhibitor` matches the ID of an inhibitor.
	 * - `listener` matches the ID of a listener.
	 *
	 * Possible Discord-related types.
	 * These types can be plural (add an 's' to the end) and a collection of matching objects will be used.
	 * - `user` tries to resolve to a user.
	 * - `member` tries to resolve to a member.
	 * - `relevant` tries to resolve to a relevant user, works in both guilds and DMs.
	 * - `channel` tries to resolve to a channel.
	 * - `textChannel` tries to resolve to a text channel.
	 * - `voiceChannel` tries to resolve to a voice channel.
	 * - `stageChannel` tries to resolve to a stage channel.
	 * - `threadChannel` tries to resolve a thread channel.
	 * - `role` tries to resolve to a role.
	 * - `emoji` tries to resolve to a custom emoji.
	 * - `guild` tries to resolve to a guild.
	 * - `permission` tries to resolve to a permissions.
	 *
	 * Other Discord-related types:
	 * - `message` tries to fetch a message from an ID within the channel.
	 * - `guildMessage` tries to fetch a message from an ID within the guild.
	 * - `relevantMessage` is a combination of the above, works in both guilds and DMs.
	 * - `invite` tries to fetch an invite object from a link.
	 * - `userMention` matches a mention of a user.
	 * - `memberMention` matches a mention of a guild member.
	 * - `channelMention` matches a mention of a channel.
	 * - `roleMention` matches a mention of a role.
	 * - `emojiMention` matches a mention of an emoji.
	 *
	 * Misc:
	 * - `duration` tries to parse duration in milliseconds
	 * - `contentWithDuration` tries to parse duration in milliseconds and returns the remaining content with the duration
	 * removed
	 */
	type?: BushArgumentType | (keyof BaseBushArgumentType)[] | BushArgumentTypeCaster;
}

export interface CustomBushArgumentOptions extends BaseBushArgumentOptions {
	/**
	 * An array of strings can be used to restrict input to only those strings, case insensitive.
	 * The array can also contain an inner array of strings, for aliases.
	 * If so, the first entry of the array will be used as the final argument.
	 *
	 * A regular expression can also be used.
	 * The evaluated argument will be an object containing the `match` and `matches` if global.
	 */
	customType?: (string | string[])[] | RegExp | string | null;
}

export type BushMissingPermissionSupplier = (message: CommandMessage | SlashMessage) => Promise<any> | any;

interface ExtendedCommandOptions {
	/**
	 * Whether the command is hidden from the help command.
	 */
	hidden?: boolean;

	/**
	 * The channels the command is limited to run in.
	 */
	restrictedChannels?: Snowflake[];

	/**
	 * The guilds the command is limited to run in.
	 */
	restrictedGuilds?: Snowflake[];

	/**
	 * Show how to use the command.
	 */
	usage: string[];

	/**
	 * Examples for how to use the command.
	 */
	examples: string[];

	/**
	 * A fake command, completely hidden from the help command.
	 */
	pseudo?: boolean;

	/**
	 * Allow this command to be run in channels that are blacklisted.
	 */
	bypassChannelBlacklist?: boolean;

	/**
	 * Use instead of {@link BaseBushCommandOptions.args} when using argument generators or custom slashOptions
	 */
	helpArgs?: ArgsInfo[];

	/**
	 * Extra information about the command, displayed in the help command.
	 */
	note?: string;
}

export interface BaseBushCommandOptions
	extends Omit<CommandOptions, 'userPermissions' | 'clientPermissions' | 'args'>,
		ExtendedCommandOptions {
	/**
	 * The description of the command.
	 */
	description: string;

	/**
	 * The arguments for the command.
	 */
	args?: BushArgumentOptions[] & CustomBushArgumentOptions[];

	category: string;

	/**
	 * Permissions required by the client to run this command.
	 */
	clientPermissions: bigint | bigint[] | BushMissingPermissionSupplier;

	/**
	 * Permissions required by the user to run this command.
	 */
	userPermissions: bigint | bigint[] | BushMissingPermissionSupplier;

	/**
	 * Whether the argument is only accessible to the owners.
	 */
	ownerOnly?: boolean;

	/**
	 * Whether the argument is only accessible to the super users.
	 */
	superUserOnly?: boolean;
}

export type BushCommandOptions = Omit<BaseBushCommandOptions, 'helpArgs'> | Omit<BaseBushCommandOptions, 'args'>;

export interface ArgsInfo {
	/**
	 * The name of the argument.
	 */
	name: string;

	/**
	 * The description of the argument.
	 */
	description: string;

	/**
	 * Whether the argument is optional.
	 * @default false
	 */
	optional?: boolean;

	/**
	 * Whether or not the argument has autocomplete enabled.
	 * @default false
	 */
	autocomplete?: boolean;

	/**
	 * Whether the argument is restricted a certain command.
	 * @default 'slash & text'
	 */
	only?: 'slash & text' | 'slash' | 'text';

	/**
	 * The method that arguments are matched for text commands.
	 * @default 'phrase'
	 */
	match?: ArgumentMatch;

	/**
	 * The readable type of the argument.
	 */
	type: string;

	/**
	 * If {@link match} is 'flag' or 'option', these are the flags that are matched
	 * @default []
	 */
	flag?: string[];

	/**
	 * Whether the argument is only accessible to the owners.
	 * @default false
	 */
	ownerOnly?: boolean;

	/**
	 * Whether the argument is only accessible to the super users.
	 * @default false
	 */
	superUserOnly?: boolean;
}

export class BushCommand extends Command {
	public declare client: BushClient;
	public declare handler: BushCommandHandler;
	public declare description: string;

	/**
	 * Show how to use the command.
	 */
	public usage: string[];

	/**
	 * Examples for how to use the command.
	 */
	public examples: string[];

	/**
	 * The options sent to the constructor
	 */
	public options: BushCommandOptions;

	/**
	 * The options sent to the super call
	 */
	public parsedOptions: CommandOptions;

	/**
	 * The channels the command is limited to run in.
	 */
	public restrictedChannels: Snowflake[] | undefined;

	/**
	 * The guilds the command is limited to run in.
	 */
	public restrictedGuilds: Snowflake[] | undefined;

	/**
	 * Whether the command is hidden from the help command.
	 */
	public hidden: boolean;

	/**
	 * A fake command, completely hidden from the help command.
	 */
	public pseudo: boolean;

	/**
	 * Allow this command to be run in channels that are blacklisted.
	 */
	public bypassChannelBlacklist: boolean;

	/**
	 * Info about the arguments for the help command.
	 */
	public argsInfo?: ArgsInfo[];

	/**
	 * Extra information about the command, displayed in the help command.
	 */
	public note?: string;

	public constructor(id: string, options: BushCommandOptions) {
		const options_ = options as BaseBushCommandOptions;

		if (options_.args && typeof options_.args !== 'function') {
			options_.args.forEach((_, index: number) => {
				if ('customType' in (options_.args?.[index] ?? {})) {
					if (!options_.args![index]['type']) options_.args![index]['type'] = options_.args![index]['customType']! as any;
					delete options_.args![index]['customType'];
				}
			});
		}

		const newOptions: Partial<CommandOptions & ExtendedCommandOptions> = {};
		for (const _key in options_) {
			const key = _key as keyof typeof options_; // you got to love typescript
			if (key === 'args' && 'args' in options_ && typeof options_.args === 'object') {
				const newTextArgs: (ArgumentOptions & ExtraArgumentOptions)[] = [];
				const newSlashArgs: SlashOption[] = [];
				for (const arg of options_.args) {
					if (arg.only !== 'slash' && !options_.slashOnly) {
						const newArg: ArgumentOptions & ExtraArgumentOptions = {};
						if ('default' in arg) newArg.default = arg.default;
						if ('description' in arg) newArg.description = arg.description;
						if ('flag' in arg) newArg.flag = arg.flag;
						if ('id' in arg) newArg.id = arg.id;
						if ('index' in arg) newArg.index = arg.index;
						if ('limit' in arg) newArg.limit = arg.limit;
						if ('match' in arg) newArg.match = arg.match;
						if ('modifyOtherwise' in arg) newArg.modifyOtherwise = arg.modifyOtherwise;
						if ('multipleFlags' in arg) newArg.multipleFlags = arg.multipleFlags;
						if ('otherwise' in arg) newArg.otherwise = arg.otherwise;
						if ('prompt' in arg || 'retry' in arg || 'optional' in arg) {
							newArg.prompt = {};
							if ('prompt' in arg) newArg.prompt.start = arg.prompt;
							if ('retry' in arg) newArg.prompt.retry = arg.retry;
							if ('optional' in arg) newArg.prompt.optional = arg.optional;
						}
						if ('type' in arg) newArg.type = arg.type as ArgumentType | ArgumentTypeCaster;
						if ('unordered' in arg) newArg.unordered = arg.unordered;
						if ('ownerOnly' in arg) newArg.ownerOnly = arg.ownerOnly;
						if ('superUserOnly' in arg) newArg.superUserOnly = arg.superUserOnly;
						newTextArgs.push(newArg);
					}
					if (
						arg.only !== 'text' &&
						!('slashOptions' in options_) &&
						(options_.slash || options_.slashOnly) &&
						arg.slashType !== false
					) {
						const newArg: {
							[key in SlashOptionKeys]?: any;
						} = {
							name: arg.id,
							// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
							description: arg.prompt || arg.description || 'No description provided.',
							type: arg.slashType
						};
						if ('slashResolve' in arg) newArg.resolve = arg.slashResolve;
						if ('autocomplete' in arg) newArg.autocomplete = arg.autocomplete;
						if ('channelTypes' in arg) newArg.channelTypes = arg.channelTypes;
						if ('choices' in arg) newArg.choices = arg.choices;
						if ('minValue' in arg) newArg.minValue = arg.minValue;
						if ('maxValue' in arg) newArg.maxValue = arg.maxValue;
						newArg.required = 'optional' in arg ? !arg.optional : true;
						newSlashArgs.push(newArg as SlashOption);
					}
				}
				if (newTextArgs.length > 0) newOptions.args = newTextArgs;
				if (newSlashArgs.length > 0) newOptions.slashOptions = options_.slashOptions ?? newSlashArgs;
			} else if (key === 'clientPermissions' || key === 'userPermissions') {
				newOptions[key] = options_[key] as PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
			} else {
				newOptions[key] = options_[key];
			}
		}

		super(id, newOptions);

		if (options_.args ?? options_.helpArgs) {
			const argsInfo: ArgsInfo[] = [];
			const combined = (options_.args ?? options_.helpArgs)!.map((arg) => {
				const norm = options_.args
					? options_.args.find((_arg) => _arg.id === ('id' in arg ? arg.id : arg.name)) ?? ({} as BushArgumentOptions)
					: ({} as BushArgumentOptions);
				const help = options_.helpArgs
					? options_.helpArgs.find((_arg) => _arg.name === ('id' in arg ? arg.id : arg.name)) ?? ({} as ArgsInfo)
					: ({} as ArgsInfo);
				return { ...norm, ...help };
			});

			for (const arg of combined) {
				const name = _.camelCase('id' in arg ? arg.id : arg.name),
					description = arg.description || '*No description provided.*',
					optional = arg.optional ?? false,
					autocomplete = arg.autocomplete ?? false,
					only = arg.only ?? 'slash & text',
					match = arg.match ?? 'phrase',
					type = match === 'flag' ? 'flag' : arg.readableType ?? arg.type ?? 'string',
					flag = arg.flag ? (Array.isArray(arg.flag) ? arg.flag : [arg.flag]) : [],
					ownerOnly = arg.ownerOnly ?? false,
					superUserOnly = arg.superUserOnly ?? false;

				argsInfo.push({ name, description, optional, autocomplete, only, match, type, flag, ownerOnly, superUserOnly });
			}

			this.argsInfo = argsInfo;
		}

		this.description = options_.description;
		this.usage = options_.usage;
		this.examples = options_.examples;
		this.options = options_;
		this.parsedOptions = newOptions;
		this.hidden = !!options_.hidden;
		this.restrictedChannels = options_.restrictedChannels;
		this.restrictedGuilds = options_.restrictedGuilds;
		this.pseudo = !!options_.pseudo;
		this.bypassChannelBlacklist = !!options_.bypassChannelBlacklist;
		this.note = options_.note;
	}
}

export interface BushCommand extends Command {
	/**
	 * Executes the command.
	 * @param message - Message that triggered the command.
	 * @param args - Evaluated arguments.
	 */
	exec(message: CommandMessage, args: any): any;
	/**
	 * Executes the command.
	 * @param message - Message that triggered the command.
	 * @param args - Evaluated arguments.
	 */
	exec(message: CommandMessage | SlashMessage, args: any): any;
}

type SlashOptionKeys =
	| keyof AkairoApplicationCommandSubGroupData
	| keyof AkairoApplicationCommandNonOptionsData
	| keyof AkairoApplicationCommandChannelOptionData
	| keyof AkairoApplicationCommandChoicesData
	| keyof AkairoApplicationCommandAutocompleteOption
	| keyof AkairoApplicationCommandNumericOptionData
	| keyof AkairoApplicationCommandSubCommandData;

interface PseudoArguments extends BaseBushArgumentType {
	boolean: boolean;
	flag: boolean;
	regex: { match: RegExpMatchArray; matches: RegExpExecArray[] };
}

export type ArgType<T extends keyof PseudoArguments> = NonNullable<PseudoArguments[T]>;
export type OptArgType<T extends keyof PseudoArguments> = PseudoArguments[T];

/**
 * `util` is always defined for messages after `'all'` inhibitors
 */
export type CommandMessage = Message & {
	/**
	 * Extra properties applied to the Discord.js message object.
	 * Utilities for command responding.
	 * Available on all messages after 'all' inhibitors and built-in inhibitors (bot, client).
	 * Not all properties of the util are available, depending on the input.
	 * */
	util: CommandUtil<Message>;
};
