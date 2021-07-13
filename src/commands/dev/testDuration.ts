import { BushCommand, BushSlashMessage } from '@lib';
import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';

export default class TestDurationCommand extends BushCommand {
	public constructor() {
		super('testduration', {
			aliases: ['testduration'],
			category: 'dev',
			description: {
				content: 'Tests duration parsing.',
				usage: 'testduration [reason]',
				examples: ['testduration']
			},
			args: [
				{
					id: 'reason',
					type: 'contentWithDuration',
					match: 'rest',
					prompt: {
						start: 'Enter text and a duration here.',
						retry: '{error} Error parsing duration and text.',
						optional: true
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'reason',
					description: 'Enter text and a duration here.',
					type: 'STRING',
					required: false
				}
			],
			hidden: true,
			ownerOnly: true
		});
	}

	async exec(
		message: Message | BushSlashMessage,
		{ reason }: { reason?: { duration: number; contentWithoutTime: string } }
	): Promise<unknown> {
		const rawDuration = reason.duration;
		const text = reason.contentWithoutTime;
		const humanizedDuration = this.client.util.humanizeDuration(rawDuration);
		return await message.util.reply(stripIndents`
		**rawDuration:** ${rawDuration}
		**text:** ${text}
		**humanizedDuration:** ${humanizedDuration}`);
	}
}
