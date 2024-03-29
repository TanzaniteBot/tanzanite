import { Client, User } from 'discord.js';
import type { RawUserData } from 'node_modules/discord.js/typings/rawDataTypes.mjs';
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
	public constructor(client: Client<true>, data: RawUserData) {
		super(client, data);

		if (this.id == null) {
			throw Object.assign(new Error(`Invalid user id: ${this.id}`, { cause: this }), { raw: data });
		}
	}

	public override isOwner(): boolean {
		return this.client.isOwner(this);
	}

	public override isSuperUser(): boolean {
		return this.client.isSuperUser(this);
	}
}
