import { User } from 'discord.js';
import { BushClient, BushDMChannel } from '..';

export class BushUser extends User {
	public declare readonly client: BushClient;
	public declare readonly dmChannel: BushDMChannel | null;
	public constructor(client: BushClient, data: unknown) {
		super(client, data);
	}

	public isOwner(): boolean {
		return this.client.isOwner(this);
	}

	public isSuperUser(): boolean {
		return this.client.isSuperUser(this);
	}
}
