import BushClient from '../extensions/BushClient';
import { BushUser } from '../extensions/BushUser';

export class BushUserSettings {
	client: BushClient;
	user: BushUser;

	constructor(client: BushClient, user: BushUser) {
		this.client = client;
		this.user = user;
	}

	//TODO: Put Stuff here when new db is done
}
