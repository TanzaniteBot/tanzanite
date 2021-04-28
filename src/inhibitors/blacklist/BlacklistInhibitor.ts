import { BotInhibitor } from '../../lib/extensions/BotInhibitor';

export default class BlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('blacklist', {
			reason: 'blacklist'
		});
	}

	public exec(): boolean | Promise<boolean> {
		// This is just a placeholder for now
		return false;
	}
}
