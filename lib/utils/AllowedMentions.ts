import type { MessageMentionOptions, MessageMentionTypes } from 'discord.js';

/**
 * A utility class for creating allowed mentions.
 */
export class AllowedMentions {
	/**
	 * @param everyone Whether everyone and here should be mentioned.
	 * @param roles Whether roles should be mentioned.
	 * @param users Whether users should be mentioned.
	 * @param repliedUser Whether the author of the Message being replied to should be mentioned.
	 */
	public constructor(
		public everyone = false,
		public roles = false,
		public users = true,
		public repliedUser = true
	) {}

	/**
	 * Don't mention anyone.
	 * @param repliedUser Whether the author of the Message being replied to should be mentioned.
	 */
	public static none(repliedUser = true): MessageMentionOptions {
		return { parse: [], repliedUser };
	}

	/**
	 * Mention @everyone and @here, roles, and users.
	 * @param repliedUser Whether the author of the Message being replied to should be mentioned.
	 */
	public static all(repliedUser = true): MessageMentionOptions {
		return { parse: ['everyone', 'roles', 'users'], repliedUser };
	}

	/**
	 * Mention users.
	 * @param repliedUser Whether the author of the Message being replied to should be mentioned.
	 */
	public static users(repliedUser = true): MessageMentionOptions {
		return { parse: ['users'], repliedUser };
	}

	/**
	 * Mention everyone and here.
	 * @param repliedUser Whether the author of the Message being replied to should be mentioned.
	 */
	public static everyone(repliedUser = true): MessageMentionOptions {
		return { parse: ['everyone'], repliedUser };
	}

	/**
	 * Mention roles.
	 * @param repliedUser Whether the author of the Message being replied to should be mentioned.
	 */
	public static roles(repliedUser = true): MessageMentionOptions {
		return { parse: ['roles'], repliedUser };
	}

	/**
	 * Converts this into a MessageMentionOptions object.
	 */
	public toObject(): MessageMentionOptions {
		return {
			parse: [
				...(this.users ? ['users'] : []),
				...(this.roles ? ['roles'] : []),
				...(this.everyone ? ['everyone'] : [])
			] as MessageMentionTypes[],
			repliedUser: this.repliedUser
		};
	}
}
