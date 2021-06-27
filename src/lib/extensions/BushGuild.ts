import { Guild } from 'discord.js';
import { Guild as GuildDB, GuildModel } from '../models/Guild';
import { BushClient } from './BushClient';

export class BushGuild extends Guild {
	public declare client: BushClient;
	public constructor(client: BushClient, data: unknown) {
		super(client, data);
	}

	public async getSetting(setting: keyof GuildModel) {
		return ((await GuildDB.findByPk(this.id)) ?? GuildDB.build({ id: this.id })).get(setting);
	}

	public async setSetting<K extends keyof GuildModel>(setting: K, value: GuildDB[K]) {
		const row = (await GuildDB.findByPk(this.id)) ?? GuildDB.build({ id: this.id });
		row[setting] = value;
		return await row.save();
	}
}
