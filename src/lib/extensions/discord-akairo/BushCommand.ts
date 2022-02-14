import { type DiscordEmojiInfo, type RoleWithDuration } from '#args';
import {
	type BushArgumentTypeCaster,
	type BushBaseGuildVoiceChannel,
	type BushCategoryChannel,
	type BushClient,
	type BushCommandHandler,
	type BushEmoji,
	type BushGuild,
	type BushGuildBasedChannel,
	type BushGuildChannel,
	type BushGuildEmoji,
	type BushGuildMember,
	type BushInhibitor,
	type BushListener,
	type BushMessage,
	type BushNewsChannel,
	type BushRole,
	type BushSlashMessage,
	type BushStageChannel,
	type BushStoreChannel,
	type BushTask,
	type BushTextChannel,
	type BushThreadChannel,
	type BushUser,
	type BushVoiceChannel,
	type ParsedDuration
} from '#lib';
import {
	Command,
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
	type ApplicationCommandOptionChoice,
	type Collection,
	type Invite,
	type PermissionResolvable,
	type PermissionsString,
	type Snowflake
} from 'discord.js';

export interface OverriddenBaseArgumentType extends BaseArgumentType {
	user: BushUser | null;
	users: Collection<string, BushUser> | null;
	member: BushGuildMember | null;
	members: Collection<string, BushGuildMember> | null;
	relevant: BushUser | BushGuildMember | null;
	relevants: Collection<string, BushUser> | Collection<string, BushGuildMember> | null;
	channel: BushGuildBasedChannel | BushBaseGuildVoiceChannel | null;
	channels: Collection<string, BushGuildBasedChannel | BushBaseGuildVoiceChannel> | null;
	textChannel: BushTextChannel | null;
	textChannels: Collection<string, BushTextChannel> | null;
	voiceChannel: BushVoiceChannel | null;
	voiceChannels: Collection<string, BushVoiceChannel> | null;
	categoryChannel: BushCategoryChannel | null;
	categoryChannels: Collection<string, BushCategoryChannel> | null;
	newsChannel: BushNewsChannel | null;
	newsChannels: Collection<string, BushNewsChannel> | null;
	// eslint-disable-next-line deprecation/deprecation
	storeChannel: BushStoreChannel | null;
	// eslint-disable-next-line deprecation/deprecation
	storeChannels: Collection<string, BushStoreChannel> | null;
	stageChannel: BushStageChannel | null;
	stageChannels: Collection<string, BushStageChannel> | null;
	threadChannel: BushThreadChannel | null;
	threadChannels: Collection<string, BushThreadChannel> | null;
	role: BushRole | null;
	roles: Collection<string, BushRole> | null;
	emoji: BushEmoji | null;
	emojis: Collection<string, BushEmoji> | null;
	guild: BushGuild | null;
	guilds: Collection<string, BushGuild> | null;
	message: BushMessage | null;
	guildMessage: BushMessage | null;
	relevantMessage: BushMessage | null;
	invite: Invite | null;
	userMention: BushUser | null;
	memberMention: BushGuildMember | null;
	channelMention: BushThreadChannel | BushGuildChannel | null;
	roleMention: BushRole | null;
	emojiMention: BushGuildEmoji | null;
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
	globalUser: BushUser | null;
	messageLink: BushMessage | null;
	durationSeconds: number | null;
}

export type BushArgumentType = keyof BaseBushArgumentType | RegExp;

interface BaseBushArgumentOptions extends Omit<ArgumentOptions, 'type' | 'prompt'> {
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
	 * ex. get the resolved member object when the type is `USER`
	 */
	slashResolve?: SlashResolveType;

	/**
	 * The choices of the option for the user to pick from
	 */
	choices?: ApplicationCommandOptionChoice[];

	/**
	 * Whether the option is an autocomplete option
	 */
	autocomplete?: boolean;

	/**
	 * When the option type is channel, the allowed types of channels that can be selected
	 */
	channelTypes?: AkairoApplicationCommandChannelOptionData['channelTypes'];

	/**
	 * The minimum value for an `INTEGER` or `NUMBER` option
	 */
	minValue?: number;

	/**
	 * The maximum value for an `INTEGER` or `NUMBER` option
	 */
	maxValue?: number;

	/**
	 * Restrict this argument to only slash or only text commands.
	 */
	only?: 'slash' | 'text';

	/**
	 * Readable type for the help command.
	 */
	readableType?: string;
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

export type BushMissingPermissionSupplier = (message: BushMessage | BushSlashMessage) => Promise<any> | any;

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
	helpArgs?: BushArgumentOptions[];

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
	 * Restrict this argument to owners
	 */
	ownerOnly?: boolean;

	/**
	 * Restrict this argument to super users.
	 */
	superUserOnly?: boolean;
}

export type BushCommandOptions = Omit<BaseBushCommandOptions, 'helpArgs'> | Omit<BaseBushCommandOptions, 'args'>;

export interface ArgsInfo {
	id: string;
	description: string;
	optional?: boolean;
	slashType: AkairoApplicationCommandOptionData['type'] | false;
	slashResolve?: SlashResolveType;
	only?: 'slash' | 'text';
	type: string;
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
				const newTextArgs: ArgumentOptions[] = [];
				const newSlashArgs: SlashOption[] = [];
				for (const arg of options_.args) {
					if (arg.only !== 'slash' && !options_.slashOnly) {
						const newArg: ArgumentOptions = {};
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

		if (options_.args || options_.helpArgs) {
			const argsInfo: ArgsInfo[] = [];

			for (const arg of (options_.args ?? options_.helpArgs)!) {
				argsInfo.push({
					id: arg.id,
					description: arg.description,
					optional: arg.optional,
					slashType: arg.slashType,
					slashResolve: arg.slashResolve,
					only: arg.only,
					type: (arg.readableType ?? arg.type) as string
				});
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
	exec(message: BushMessage, args: any): any;
	/**
	 * Executes the command.
	 * @param message - Message that triggered the command.
	 * @param args - Evaluated arguments.
	 */
	exec(message: BushMessage | BushSlashMessage, args: any): any;
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
}

export type ArgType<T extends keyof PseudoArguments> = NonNullable<PseudoArguments[T]>;
export type OptionalArgType<T extends keyof PseudoArguments> = PseudoArguments[T];
