import { BushTask, Time } from '#lib';
import { GuildCount } from '../../../lib/models/shared/GuildCount.js';

export default class GuildCountTask extends BushTask {
	public constructor() {
		super('guildCount', {
			delay: 15 * Time.Minute,
			runOnStart: true
		});
	}

	public override async exec() {
		if (!this.client.config.isProduction) return;

		try {
			await GuildCount.create({
				environment: this.client.config.environment,
				guildCount: this.client.guilds.cache.size
			});
		} catch (err) {
			void this.client.console.error('guildCount', err);
		}
	}
}
