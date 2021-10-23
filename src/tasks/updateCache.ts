import { BushClient, Global, Guild } from '@lib';
import { BushTask } from '../lib/extensions/discord-akairo/BushTask';
import config from './../config/options';

export default class UpdateCacheTask extends BushTask {
	public constructor() {
		super('updateCache', {
			delay: 300_000, // 5 minutes
			runOnStart: false // done in preinit task
		});
	}
	public override async exec(): Promise<void> {
		await UpdateCacheTask.updateGlobalCache(client);
		await UpdateCacheTask.#updateGuildCache(client);
		void client.logger.verbose(`UpdateCache`, `Updated cache.`);
	}

	public static async init(client: BushClient): Promise<void> {
		await UpdateCacheTask.updateGlobalCache(client);
		await UpdateCacheTask.#updateGuildCache(client);
	}

	private static async updateGlobalCache(client: BushClient): Promise<void> {
		const environment = config.environment;
		const row: { [x: string]: any } = ((await Global.findByPk(environment)) ?? (await Global.create({ environment }))).toJSON();

		for (const option in row) {
			if (Object.keys(client.cache.global).includes(option)) {
				client.cache.global[option as keyof typeof client.cache.global] = row[option];
				if (option === 'superUsers') client.superUserID = row[option];
			}
		}
	}

	static async #updateGuildCache(client: BushClient): Promise<void> {
		const rows = await Guild.findAll();
		for (const row of rows) {
			client.cache.guilds.set(row.id, row.toJSON() as Guild);
		}
	}
}
