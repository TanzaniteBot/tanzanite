import { BushClient } from '../lib/extensions/discord-akairo/BushClient';
import { BushTask } from '../lib/extensions/discord-akairo/BushTask';
import { Global } from '../lib/models';
import * as config from './../config/options';

export default class UpdateCacheTask extends BushTask {
	public constructor() {
		super('updateCache', {
			delay: 300_000, // 5 minutes
			runOnStart: false // done in preinit task
		});
	}
	async exec(): Promise<void> {
		await this.updateCache(this.client);
		await this.client.logger.verbose(`UpdateCache`, `Updated cache.`);
	}

	async init(client: BushClient): Promise<void> {
		await this.updateCache(client);
	}

	async updateCache(client: BushClient): Promise<void> {
		const environment = config.dev ? 'development' : 'production';
		const row =
			(await Global.findByPk(environment)) ||
			(await Global.create({
				environment,
				superUsers: [],
				blacklistedChannels: [],
				blacklistedGuilds: [],
				blacklistedUsers: [],
				disabledCommands: []
			}));

		for (const option in row) {
			if (client.cache[option]) this.client.cache[option] = row[option];
		}
	}
}
