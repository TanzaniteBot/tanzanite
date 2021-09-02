import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { Role, Util } from 'discord.js';

export default class WhoHasRoleCommand extends BushCommand {
	public constructor() {
		super('whohasrole', {
			aliases: ['whohasrole', 'whr', 'dump'],
			category: 'utilities',
			description: {
				content: 'Allows you to view what users have a certain role.',
				usage: 'template <requiredArg> [optionalArg]',
				examples: ['template 1 2']
			},
			args: [
				{
					id: 'role',
					type: 'role',
					prompt: {
						start: 'What role would you like to find the users of?',
						retry: '{error} Pick a valid role.',
						optional: false
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'role',
					description: 'What role would you like to find the users of?',
					type: 'ROLE',
					required: true
				}
			],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES'],
			typing: true
		});
	}
	public override async exec(message: BushMessage | BushSlashMessage, args: { role: Role }): Promise<unknown> {
		// console.time('whohasrole1');
		const roleMembers = args.role.members.map((member) => `${member.user} (${Util.escapeMarkdown(member.user.tag)})`);
		// console.timeEnd('whohasrole1');

		// console.time('whohasrole2');
		const chunkedRoleMembers = util.chunk(roleMembers, 30);
		// console.timeEnd('whohasrole2');

		// console.time('whohasrole3');
		const title = `${args.role.name}'s Members [\`${args.role.members.size.toLocaleString()}\`]`;
		const color = util.colors.default;
		const embedPages = chunkedRoleMembers.map((chunk) => ({
			title,
			description: chunk.join('\n'),
			color
		}));
		// console.timeEnd('whohasrole3');

		return await util.buttonPaginate(message, embedPages, null, true);
	}
}
