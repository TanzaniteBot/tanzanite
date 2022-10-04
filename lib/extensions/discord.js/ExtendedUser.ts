import { User } from 'discord.js';
import type { TanzaniteClient } from '../discord-akairo/TanzaniteClient.js';

interface Extension {
	/**
	 * Indicates whether the user is an owner of the bot.
	 */
	isOwner(): boolean;
	/**
	 * Indicates whether the user is a superuser of the bot.
	 */
	isSuperUser(): boolean;
}

declare module 'discord.js' {
	export interface User extends Extension {
		readonly client: TanzaniteClient<true>;
	}
}

export class ExtendedUser extends User implements Extension {
	public override isOwner(): boolean {
		return this.client.isOwner(this);
	}

	public override isSuperUser(): boolean {
		return this.client.isSuperUser(this);
	}
}
