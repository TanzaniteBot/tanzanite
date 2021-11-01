import { BushCommand, ButtonPaginator, type BushMessage, type BushSlashMessage } from '#lib';
import { Util, type CommandInteraction, type Role } from 'discord.js';

export default class WhoHasRoleCommand extends BushCommand {
	public constructor() {
		super('whoHasRole', {
			aliases: ['who-has-role', 'whr', 'dump'],
			category: 'utilities',
			description: {
				content: 'Allows you to view what users have a certain role.',
				usage: ['who-has-role <role>'],
				examples: ['who-has-role admin']
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
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: [],
			typing: true
		});
	}
	public override async exec(message: BushMessage | BushSlashMessage, args: { role: Role }) {
		if (message.util.isSlash) await (message.interaction as CommandInteraction).deferReply();
		const roleMembers = args.role.members.map((member) => `${member.user} (${Util.escapeMarkdown(member.user.tag)})`);

		const chunkedRoleMembers = util.chunk(roleMembers, 30);

		const title = `${args.role.name}'s Members [\`${args.role.members.size.toLocaleString()}\`]`;
		const color = util.colors.default;
		const embedPages = chunkedRoleMembers.map((chunk) => ({
			title,
			description: chunk.join('\n'),
			color
		}));

		return await ButtonPaginator.send(message, embedPages, null, true);
	}
}
