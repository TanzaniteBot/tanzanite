import { BushListener } from '#lib';
import { exec } from 'child_process';
import { promisify } from 'util';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
/* export default  */ class ConsoleListener extends BushListener {
	public constructor() {
		super('console', {
			emitter: 'stdin',
			event: 'line'
		});
	}

	public async exec(line: string) {
		if (line.startsWith('eval ') || line.startsWith('ev ')) {
			/* eslint-disable @typescript-eslint/no-unused-vars */
			const sh = promisify(exec),
				bot = this.client,
				client = this.client,
				config = this.client.config,
				{ ActivePunishment, Global, Guild, Level, ModLog, StickyRole } = await import('#lib'),
				{
					ButtonInteraction,
					Collector,
					CommandInteraction,
					Interaction,
					Message,
					ActionRow,
					Attachment,
					ButtonComponent,
					MessageCollector,
					InteractionCollector,
					Embed,
					SelectMenuComponent,
					ReactionCollector,
					Collection
				} = await import('discord.js');
			/* eslint-enable @typescript-eslint/no-unused-vars */
			try {
				const depth = /--depth (?<depth>\d+)/.exec(line)?.groups?.depth ?? undefined;
				const hidden = /--hidden/.test(line);
				if (depth) line = line.replace(/--depth \d+/, '');
				if (hidden) line = line.replace(/--hidden/, '');
				const input = line.replace('eval ', '').replace('ev ', '');
				const output = await eval(input);
				console.dir(output, {
					colors: true,
					getters: true,
					maxArrayLength: Infinity,
					maxStringLength: Infinity,
					depth: +(depth ?? 2),
					showHidden: hidden
				});
			} catch (e) {
				console.error(e);
			}
		} else if (line.startsWith('stop')) {
			process.exit(0);
		}
	}
}
