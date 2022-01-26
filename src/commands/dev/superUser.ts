import { BushCommand, type ArgType, type BushMessage } from '#lib';
import { ArgumentGeneratorReturn } from 'discord-akairo';
import { ArgumentTypeCasterReturn } from 'discord-akairo/dist/src/struct/commands/arguments/Argument';

export default class SuperUserCommand extends BushCommand {
	public constructor() {
		super('superuser', {
			aliases: ['superuser', 'su'],
			category: 'dev',
			description: 'A command to manage superusers.',
			usage: ['superuser <add/remove> <user>'],
			examples: ['superuser add IRONM00N'],
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: [],
			ownerOnly: true,
			helpArgs: [
				{
					id: 'action',
					description: 'Whether to add or remove a user from the superuser list.',
					readableType: 'add|remove',
					slashType: false
				},
				{
					id: 'user',
					description: 'The user to add/remove from the superuser list.',
					type: 'user',
					match: 'restContent',
					slashType: false
				}
			]
		});
	}

	override *args(): ArgumentGeneratorReturn {
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

	public override async exec(message: BushMessage, { action, user }: { action: 'add' | 'remove'; user: ArgType<'user'> }) {
		if (!message.author.isOwner())
			return await message.util.reply(`${util.emojis.error} Only my developers can run this command.`);

		const superUsers: string[] = util.getShared('superUsers');

		if (action === 'add' ? superUsers.includes(user.id) : !superUsers.includes(user.id))
			return message.util.reply(`${util.emojis.warn} \`${user.tag}\` is ${action === 'add' ? 'already' : 'not'} a superuser.`);

		const success = await util.insertOrRemoveFromShared(action, 'superUsers', user.id).catch(() => false);

		if (success) {
			return await message.util.reply(
				`${util.emojis.success} ${action == 'remove' ? '' : 'made'} \`${user.tag}\` ${
					action == 'remove' ? 'is no longer ' : ''
				}a superuser.`
			);
		} else {
			return await message.util.reply(
				`${util.emojis.error} There was an error ${action == 'remove' ? `removing` : 'making'} \`${user.tag}\` ${
					action == 'remove' ? `from` : 'to'
				} the superuser list.`
			);
		}
	}
}
