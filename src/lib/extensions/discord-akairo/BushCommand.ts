import { ArgumentOptions, ArgumentPromptOptions, ArgumentTypeCaster, Command, CommandOptions } from 'discord-akairo';
import { PermissionResolvable, Snowflake } from 'discord.js';
import { BushMessage } from '../discord.js/BushMessage';
import { BushClient } from './BushClient';
import { BushCommandHandler } from './BushCommandHandler';
import { BushSlashMessage } from './BushSlashMessage';

export type BaseBushArgumentType =
	| 'string'
	| 'lowercase'
	| 'uppercase'
	| 'charCodes'
	| 'number'
	| 'integer'
	| 'bigint'
	| 'emojint'
	| 'url'
	| 'date'
	| 'color'
	| 'user'
	| 'users'
	| 'member'
	| 'members'
	| 'relevant'
	| 'relevants'
	| 'channel'
	| 'channels'
	| 'textChannel'
	| 'textChannels'
	| 'voiceChannel'
	| 'voiceChannels'
	| 'categoryChannel'
	| 'categoryChannels'
	| 'newsChannel'
	| 'newsChannels'
	| 'storeChannel'
	| 'storeChannels'
	| 'stageChannel'
	| 'stageChannels'
	| 'threadChannel'
	| 'threadChannels'
	| 'role'
	| 'roles'
	| 'emoji'
	| 'emojis'
	| 'guild'
	| 'guilds'
	| 'message'
	| 'guildMessage'
	| 'relevantMessage'
	| 'invite'
	| 'userMention'
	| 'memberMention'
	| 'channelMention'
	| 'roleMention'
	| 'emojiMention'
	| 'commandAlias'
	| 'command'
	| 'inhibitor'
	| 'listener'
	| 'duration'
	| 'contentWithDuration'
	| 'permission'
	| 'snowflake'
	| 'discordEmoji'
	| 'roleWithDuration'
	| 'abbreviatedNumber'
	| 'globalUser';

export type BushArgumentType = BaseBushArgumentType | RegExp;

interface BaseBushArgumentOptions extends Omit<ArgumentOptions, 'type'> {
	id: string;
	description?: string;
	prompt?: ArgumentPromptOptions;
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
	type?: BushArgumentType | BaseBushArgumentType[];
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
	customType?: ArgumentTypeCaster | (string | string[])[] | RegExp | string | null;
}

export type BushMissingPermissionSupplier = (message: BushMessage | BushSlashMessage) => Promise<any> | any;

export interface BushCommandOptions extends Omit<CommandOptions, 'userPermissions' | 'clientPermissions'> {
	/** Whether the command is hidden from the help command. */
	hidden?: boolean;
	/** The channels the command is limited to run in. */
	restrictedChannels?: Snowflake[];
	/** The guilds the command is limited to run in. */
	restrictedGuilds?: Snowflake[];
	description: {
		content: string;
		usage: string | string[];
		examples: string | string[];
	};
	args?: BushArgumentOptions[] & CustomBushArgumentOptions[];
	category: string;
	/** A fake command, completely hidden from the help command. */
	pseudo?: boolean;
	/** Allow this command to be run in channels that are blacklisted. */
	bypassChannelBlacklist?: boolean;
	/** Permissions required by the client to run this command. */
	clientPermissions?: PermissionResolvable | PermissionResolvable[] | BushMissingPermissionSupplier;
	/** Permissions required by the user to run this command. */
	userPermissions?: PermissionResolvable | PermissionResolvable[] | BushMissingPermissionSupplier;
}

export class BushCommand extends Command {
	public declare client: BushClient;

	public declare handler: BushCommandHandler;

	/** The command's options */
	public options: BushCommandOptions;

	/** The channels the command is limited to run in. */
	public restrictedChannels: Snowflake[] | undefined;

	/** The guilds the command is limited to run in. */
	public restrictedGuilds: Snowflake[] | undefined;

	/** Whether the command is hidden from the help command. */
	public hidden: boolean;

	/** A fake command, completely hidden from the help command. */
	public pseudo: boolean;

	/** Allow this command to be run in channels that are blacklisted. */
	public bypassChannelBlacklist: boolean;

	public constructor(id: string, options: BushCommandOptions) {
		if (options.args && typeof options.args !== 'function') {
			options.args.forEach((_, index: number) => {
				if ('customType' in options.args![index]) {
					// @ts-expect-error: shut
					if (!options.args[index]['type']) options.args[index]['type'] = options.args[index]['customType'];
					delete options.args![index]['customType'];
				}
			});
		}
		// incompatible options
		super(id, options as any);
		this.options = options;
		this.hidden = Boolean(options.hidden);
		this.restrictedChannels = options.restrictedChannels;
		this.restrictedGuilds = options.restrictedGuilds;
		this.pseudo = Boolean(options.pseudo);
		this.bypassChannelBlacklist = Boolean(options.bypassChannelBlacklist);
	}

	public override exec(message: BushMessage, args: any): any;
	public override exec(message: BushMessage | BushSlashMessage, args: any): any {
		super.exec(message, args);
	}
}
