import { User } from 'discord.js';
import { BushUserSettings } from '../utils/BushUserSettings';
import BushClient from './BushClient';

export class BushUser extends User {
	client: BushClient;
	settings: BushUserSettings;

	// eslint-disable-next-line @typescript-eslint/ban-types
	constructor(client: BushClient, data: object) {
		super(client, data);
		this.settings = new BushUserSettings(this.client, this);
	}

	//TODO put stuff here when db is ready
}
