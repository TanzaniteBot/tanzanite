import { BushClientEvents, BushListener, PresenceAutomod } from '#lib';
import chalk from 'chalk';

/* export default */ class PresenceAutomodListener extends BushListener {
	public constructor() {
		super('presenceAutomod', {
			emitter: 'client',
			event: 'presenceUpdate'
		});
	}

	public async exec(...[_, newPresence]: BushClientEvents['presenceUpdate']) {
		if (!newPresence.member || !newPresence.guild) return;

		if (!newPresence.activities.length) return;

		if (!(await newPresence.guild.hasFeature('automodPresence'))) return;
		if (!(await newPresence.guild.hasFeature('automod'))) return;

		new PresenceAutomod(newPresence);
		console.log(
			`${chalk.hex('#ffe605')('[PresenceAutomod]')} Created a new PresenceAutomod for ${newPresence.member.user.tag} (${
				newPresence.member.user.id
			})`
		);
	}
}
