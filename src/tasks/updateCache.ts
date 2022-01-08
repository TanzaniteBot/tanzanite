import { Global, Guild, Shared, type BushClient } from '#lib';
import { BushTask } from '../lib/extensions/discord-akairo/BushTask.js';
import config from './../config/options.js';

export default class UpdateCacheTask extends BushTask {
	public constructor() {
		super('updateCache', {
			delay: 300_000, // 5 minutes
			runOnStart: false // done in preinit task
		});
	}

	public override async exec() {
		await Promise.all([
			UpdateCacheTask.#updateGlobalCache(client),
			UpdateCacheTask.#updateSharedCache(client),
			UpdateCacheTask.#updateGuildCache(client)
		]);
		void client.logger.verbose(`UpdateCache`, `Updated cache.`);
	}

	public static async init(client: BushClient) {
		await Promise.all([
			UpdateCacheTask.#updateGlobalCache(client),
			UpdateCacheTask.#updateSharedCache(client),
			UpdateCacheTask.#updateGuildCache(client)
		]);
	}

	static async #updateGlobalCache(client: BushClient) {
		const environment = config.environment;
		const row: { [x: string]: any } = ((await Global.findByPk(environment)) ?? (await Global.create({ environment }))).toJSON();

		for (const option in row) {
			if (Object.keys(client.cache.global).includes(option)) {
				client.cache.global[option as keyof typeof client.cache.global] = row[option];
			}
		}
	}

	static async #updateSharedCache(client: BushClient) {
		const row: { [x: string]: any } = ((await Shared.findByPk(0)) ?? (await Shared.create())).toJSON();

		for (const option in row) {
			if (Object.keys(client.cache.shared).includes(option)) {
				client.cache.shared[option as keyof typeof client.cache.shared] = row[option];
				if (option === 'superUsers') client.superUserID = row[option];
			}
		}
	}

	static async #updateGuildCache(client: BushClient) {
		const rows = await Guild.findAll();
		for (const row of rows) {
			client.cache.guilds.set(row.id, row.toJSON() as Guild);
		}
	}
}
