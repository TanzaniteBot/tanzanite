/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ArgumentOptions, ArgumentPromptOptions, ArgumentTypeCaster, Command, CommandOptions } from 'discord-akairo';
import { Snowflake } from 'discord.js';
import { BushMessage } from '../discord.js/BushMessage';
import { BushClient } from './BushClient';
import { BushCommandHandler } from './BushCommandHandler';
import { BushSlashMessage } from './BushSlashMessage';

export type BushArgumentType =
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
	| 'permission';
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
	type?: BushArgumentType;
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

export interface BushCommandOptions extends CommandOptions {
	hidden?: boolean;
	restrictedChannels?: Snowflake[];
	restrictedGuilds?: Snowflake[];
	description: {
		content: string;
		usage: string | string[];
		examples: string | string[];
	};
	args?: BushArgumentOptions[] & CustomBushArgumentOptions[];
	category: string;
	completelyHide?: boolean;
}

export class BushCommand extends Command {
	public declare client: BushClient;

	public declare handler: BushCommandHandler;

	public options: BushCommandOptions;

	/** The channels the command is limited to run in. */
	public restrictedChannels: Snowflake[];

	/** The guilds the command is limited to run in. */
	public restrictedGuilds: Snowflake[];

	/** Whether the command is hidden from the help command. */
	public hidden: boolean;

	/** Completely hide this command from the help command. */
	public completelyHide: boolean;

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
		super(id, options);
		this.options = options;
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		this.hidden = options.hidden || false;
		this.restrictedChannels = options.restrictedChannels!;
		this.restrictedGuilds = options.restrictedGuilds!;
		this.completelyHide = options.completelyHide!;
	}

	public override exec(message: BushMessage, args: any): any;
	public override exec(message: BushMessage | BushSlashMessage, args: any): any {
		super.exec(message, args);
	}
}
