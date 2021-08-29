import { BushCommand, BushMessage, BushSlashMessage, Global } from '@lib';
import { ArgumentOptions, Flag } from 'discord-akairo';
import { User } from 'discord.js';

export default class SuperUserCommand extends BushCommand {
	public constructor() {
		super('superuser', {
			aliases: ['superuser', 'su'],
			category: 'dev',
			description: {
				content: 'A command to manage superusers.',
				usage: 'superuser <add/remove> <user>',
				examples: ['superuser add IRONM00N']
			},
			clientPermissions: ['SEND_MESSAGES'],
			ownerOnly: true
		});
	}
	*args(): IterableIterator<ArgumentOptions | Flag> {
		const action = yield {
			id: 'action',
			type: ['add', 'remove'],
			prompt: {
				start: 'Would you like to `add` or `remove` a user from the superuser list?',
				retry: '{error} Choose if you would like to `add` or `remove` a user.',
				optional: false
			}
		};
		const user = yield {
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
	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { action: 'add' | 'remove'; user: User }
	): Promise<unknown> {
		if (!message.author.isOwner())
			return await message.util.reply(`${util.emojis.error} Only my developers can run this command.`);

		if (!args.user?.id)
			return await message.util.reply(
				`${util.emojis.error} I fucked up here is args ${await util.inspectCleanRedactCodeblock(args, 'ts')}`
			);

		const superUsers: string[] = (await Global.findByPk(client.config.environment))?.superUsers ?? [];
		let success;
		if (args.action === 'add') {
			if (superUsers.includes(args.user.id)) {
				return message.util.reply(`${util.emojis.warn} \`${args.user.tag}\` is already a superuser.`);
			}
			success = await util.insertOrRemoveFromGlobal('add', 'superUsers', args.user.id).catch(() => false);
		} else {
			if (!superUsers.includes(args.user.id)) {
				return message.util.reply(`${util.emojis.warn} \`${args.user.tag}\` is not superuser.`);
			}
			success = await util.insertOrRemoveFromGlobal('remove', 'superUsers', args.user.id).catch(() => false);
		}
		if (success) {
			const responses = [args.action == 'remove' ? '' : 'made', args.action == 'remove' ? 'is no longer' : ''];
			return message.util.reply(`${util.emojis.success} ${responses[0]} \`${args.user.tag}\` ${responses[1]} a superuser.`);
		} else {
			const response = [args.action == 'remove' ? `removing` : 'making', args.action == 'remove' ? `from` : 'to'];
			return message.util.reply(
				`${util.emojis.error} There was an error ${response[0]} \`${args.user.tag}\` ${response[1]} the superuser list.`
			);
		}
	}
}
