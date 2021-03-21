import BushClient from '../extensions/BushClient';
import { BushGuild } from '../extensions/BushGuild';
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

export class BushGuildSettings {
	client: BushClient;
	guild: BushGuild;

	constructor(client: BushClient, guild: BushGuild) {
		this.client = client;
		this.guild = guild;
	}

	//TODO: Put Stuff here when new db is done
}
