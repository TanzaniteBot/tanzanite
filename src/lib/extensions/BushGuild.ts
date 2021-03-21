import { Guild } from 'discord.js';
import { BushGuildSettings } from '../utils/BushUserSettings';
import BushClient from './BushClient';

export class BushGuild extends Guild {
	settings: BushGuildSettings;
	guild: BushGuild;
	client: BushClient;

	// eslint-disable-next-line @typescript-eslint/ban-types
	constructor(client: BushClient, data: object) {
		super(client, data);
		this.settings = new BushGuildSettings(client, this);
	}
}
