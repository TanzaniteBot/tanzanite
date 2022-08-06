import { BushCommand, clientSendAndPermCheck, emojis, format, type ArgType, type CommandMessage } from '#lib';
import { type ArgumentGeneratorReturn, type ArgumentTypeCasterReturn } from 'discord-akairo';

export default class SuperUserCommand extends BushCommand {
	public constructor() {
		super('superUser', {
			aliases: ['super-user', 'su'],
			category: 'dev',
			description: 'A command to manage superusers.',
			usage: ['superuser <add/remove> <user>'],
			examples: ['superuser add IRONM00N'],
			clientPermissions: (m) => clientSendAndPermCheck(m),
			userPermissions: [],
			ownerOnly: true,
			helpArgs: [
				{
					name: 'action',
					description: 'Whether to add or remove a user from the superuser list.',
					type: "'add'|'remove'"
				},
				{
					name: 'user',
					description: 'The user to add/remove from the superuser list.',
					type: 'user',
					match: 'restContent'
				}
			]
		});
	}

	public override *args(): ArgumentGeneratorReturn {
		const action: 'add' | 'remove' = yield {
			id: 'action',
			type: ['add', 'remove'],
			prompt: {
				start: 'Would you like to `add` or `remove` a user from the superuser list?',
				retry: '{error} Choose if you would like to `add` or `remove` a user.',
				optional: false
			}
		};

		const user: ArgumentTypeCasterReturn<'user'> = yield {
			id: 'user',
			type: 'user',
			match: 'restContent',
			prompt: {
				start: `Who would you like to ${action ?? 'add/remove'} from the superuser list?`,
				retry: `Choose a valid user to ${action ?? 'add/remove'} from the superuser list.`,
				optional: false
			}
		};

		return { action, user };
	}

	public override async exec(message: CommandMessage, args: { action: 'add' | 'remove'; user: ArgType<'user'> }) {
		if (!message.author.isOwner()) return await message.util.reply(`${emojis.error} Only my developers can run this command.`);

		const superUsers: string[] = this.client.utils.getShared('superUsers');

		if (args.action === 'add' ? superUsers.includes(args.user.id) : !superUsers.includes(args.user.id))
			return message.util.reply(
				`${emojis.warn} ${format.input(args.user.tag)} is ${args.action === 'add' ? 'already' : 'not'} a superuser.`
			);

		const success = await this.client.utils.insertOrRemoveFromShared(args.action, 'superUsers', args.user.id).catch(() => false);

		if (success) {
			return await message.util.reply(
				`${emojis.success} ${args.action == 'remove' ? '' : 'made'} ${format.input(args.user.tag)} ${
					args.action == 'remove' ? 'is no longer ' : ''
				}a superuser.`
			);
		} else {
			return await message.util.reply(
				`${emojis.error} There was an error ${args.action == 'remove' ? `removing` : 'making'} ${format.input(args.user.tag)} ${
					args.action == 'remove' ? `from` : 'to'
				} the superuser list.`
			);
		}
	}
}
