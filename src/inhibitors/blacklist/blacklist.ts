import { BushInhibitor } from '../../lib/extensions/BushInhibitor';

export default class BlacklistInhibitor extends BushInhibitor {
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
