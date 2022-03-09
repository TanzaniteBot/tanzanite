import type { BushClient, BushDMChannel } from '#lib';
import { User, type Partialize } from 'discord.js';
import type { RawUserData } from 'discord.js/typings/rawDataTypes';

export type PartialBushUser = Partialize<BushUser, 'username' | 'tag' | 'discriminator' | 'isOwner' | 'isSuperUser'>;

/**
 * Represents a user on Discord.
 */
export class BushUser extends User {
	public declare readonly client: BushClient;

	public constructor(client: BushClient, data: RawUserData) {
		super(client, data);
	}

	/**
	 * Indicates whether the user is an owner of the bot.
	 */
	public isOwner(): boolean {
		return client.isOwner(this);
	}

	/**
	 * Indicates whether the user is a superuser of the bot.
	 */
	public isSuperUser(): boolean {
		return client.isSuperUser(this);
	}
}

export interface BushUser extends User {
	get dmChannel(): BushDMChannel | null;
}
