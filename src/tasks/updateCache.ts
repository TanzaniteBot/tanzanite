import { BushClient } from '../lib/extensions/discord-akairo/BushClient';
import { BushTask } from '../lib/extensions/discord-akairo/BushTask';
import { Global } from '../lib/models/Global';
import config from './../config/options';

export class UpdateCacheTask extends BushTask {
	public constructor() {
		super('updateCache', {
			delay: 300_000, // 5 minutes
			runOnStart: false // done in preinit task
		});
	}
	public async exec(): Promise<void> {
		await UpdateCacheTask.updateCache(this.client);
		await this.client.logger.verbose(`UpdateCache`, `Updated cache.`);
	}

	public static async init(client: BushClient): Promise<void> {
		await UpdateCacheTask.updateCache(client);
	}

	private static async updateCache(client: BushClient): Promise<void> {
		const environment = config.environment;
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
			if (client.cache[option]) client.cache[option] = row[option];
		}
	}
}