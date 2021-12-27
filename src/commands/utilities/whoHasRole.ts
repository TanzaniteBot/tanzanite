import { ArgType, BushCommand, ButtonPaginator, type BushMessage, type BushSlashMessage } from '#lib';
import { Util, type CommandInteraction } from 'discord.js';

export default class WhoHasRoleCommand extends BushCommand {
	public constructor() {
		super('whoHasRole', {
			aliases: ['who-has-role', 'whr', 'dump'],
			category: 'utilities',
			description: 'Allows you to view what users have a certain role.',
			usage: ['who-has-role <role>'],
			examples: ['who-has-role admin'],
			args: [
				{
					id: 'role',
					description: 'The role to find the users of.',
					type: 'role',
					prompt: 'What role would you like to find the users of?',
					retry: '{error} Pick a valid role.',
					optional: false,
					slashType: 'ROLE'
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: [],
			typing: true
		});
	}
	public override async exec(message: BushMessage | BushSlashMessage, args: { role: ArgType<'role'> }) {
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
