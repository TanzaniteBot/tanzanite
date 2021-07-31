/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BushListener } from '@lib';
import { exec } from 'child_process';
import { promisify } from 'util';

export default class ConsoleListener extends BushListener {
	public constructor() {
		super('console', {
			emitter: 'stdin',
			event: 'line'
		});
	}

	public override async exec(line: string): Promise<void> {
		if (line.startsWith('eval ') || line.startsWith('ev ')) {
			const sh = promisify(exec),
				bot = client,
				config = client.config,
				{ ActivePunishment, Global, Guild, Level, ModLog, StickyRole } = await import('@lib'),
				{
					ButtonInteraction,
					Collector,
					CommandInteraction,
					Interaction,
					Message,
					MessageActionRow,
					MessageAttachment,
					MessageButton,
					MessageCollector,
					InteractionCollector,
					MessageEmbed,
					MessageSelectMenu,
					ReactionCollector,
					Util,
					Collection
				} = await import('discord.js');
			try {
				const input = line.replace('eval ', '').replace('ev ', '');
				let output = eval(input);
				output = await output;
				console.log(output);
			} catch (e) {
				console.error(e?.stack || e);
			}
		} else if (line.startsWith('stop')) {
			process.exit(0);
		}
	}
}
