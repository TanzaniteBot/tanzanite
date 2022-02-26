import { BushInhibitor, type BushMessage, type BushSlashMessage } from '#lib';

export default class FatalInhibitor extends BushInhibitor {
	public constructor() {
		super('fatal', {
			reason: 'fatal',
			type: 'all',
			category: 'checks',
			priority: 100
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage): Promise<boolean> {
		if (message.author.isOwner()) return false;
		for (const property in client.cache.global) {
			if (!client.cache.global[property as keyof typeof client.cache.global]) {
				void client.console.verbose(
					'fatal',
					`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
				);
				return true;
			}
		}
		return false;
	}
}
