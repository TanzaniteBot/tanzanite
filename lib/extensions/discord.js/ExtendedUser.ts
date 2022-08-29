import { User } from 'discord.js';

declare module 'discord.js' {
	export interface User {
		/**
		 * Indicates whether the user is an owner of the bot.
		 */
		isOwner(): boolean;
		/**
		 * Indicates whether the user is a superuser of the bot.
		 */
		isSuperUser(): boolean;
	}
}

/**
 * Represents a user on Discord.
 */
export class ExtendedUser extends User {
	/**
	 * Indicates whether the user is an owner of the bot.
	 */
	public override isOwner(): boolean {
		return this.client.isOwner(this);
	}

	/**
	 * Indicates whether the user is a superuser of the bot.
	 */
	public override isSuperUser(): boolean {
		return this.client.isSuperUser(this);
	}
}
