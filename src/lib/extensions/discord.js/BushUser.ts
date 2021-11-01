import type { BushClient, BushDMChannel } from '#lib';
import { User, type Partialize } from 'discord.js';
import type { RawUserData } from 'discord.js/typings/rawDataTypes';

export type PartialBushUser = Partialize<BushUser, 'username' | 'tag' | 'discriminator' | 'isOwner' | 'isSuperUser'>;

export class BushUser extends User {
	public declare readonly client: BushClient;
	public declare readonly dmChannel: BushDMChannel | null;
	public constructor(client: BushClient, data: RawUserData) {
		super(client, data);
	}

	public isOwner(): boolean {
		return client.isOwner(this);
	}

	public isSuperUser(): boolean {
		return client.isSuperUser(this);
	}
}
