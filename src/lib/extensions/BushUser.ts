import { Structures, User } from 'discord.js';
import { BushClient } from './BushClient';

export class BushUser extends User {
	public declare client: BushClient;
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

Structures.extend('User', () => BushUser);
