import { BushClient } from '../lib/extensions/discord-akairo/BushClient';
import { BushTask } from '../lib/extensions/discord-akairo/BushTask';
import { Global } from '../lib/models/Global';
import { Guild } from '../lib/models/Guild';
import config from './../config/options';

export class UpdateCacheTask extends BushTask {
	public constructor() {
		super('updateCache', {
			delay: 300_000, // 5 minutes
			runOnStart: false // done in preinit task
		});
	}
	public async exec(): Promise<void> {
		await UpdateCacheTask.updateGlobalCache(client);
		await UpdateCacheTask.updateGuildCache(client);
		void client.logger.verbose(`UpdateCache`, `Updated cache.`);
	}

	public static async init(client: BushClient): Promise<void> {
		await UpdateCacheTask.updateGlobalCache(client);
		await UpdateCacheTask.updateGuildCache(client);
	}

	private static async updateGlobalCache(client: BushClient): Promise<void> {
		const environment = config.environment;
		const row = (
			(await Global.findByPk(environment)) ||
			(await Global.create({
				environment,
				superUsers: [],
				blacklistedChannels: [],
				blacklistedGuilds: [],
				blacklistedUsers: [],
				disabledCommands: []
			}))
		).toJSON();

		for (const option in row) {
			if (Object.keys(client.cache.global).includes(option)) client.cache.global[option] = row[option];
		}
	}

	private static async updateGuildCache(client: BushClient): Promise<void> {
		const rows = await Guild.findAll();
		for (const row of rows) {
			client.cache.guilds.set(row.id, row.toJSON() as Guild);
		}
	}
}
