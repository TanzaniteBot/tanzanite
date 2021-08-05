import { User } from 'discord.js';
import { RawUserData } from 'discord.js/typings/rawDataTypes';
import { BushClient } from '../discord-akairo/BushClient';
import { BushDMChannel } from './BushDMChannel';

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
