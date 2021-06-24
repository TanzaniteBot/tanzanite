import { User } from 'discord.js';
import { BushCommand } from '../../lib/extensions/BushCommand';
import { BushMessage } from '../../lib/extensions/BushMessage';
import { Global } from '../../lib/models';

export default class WelcomeChannelCommand extends BushCommand {
	public constructor() {
		super('welcomeChannel', {
			aliases: ['welcomechannel', 'wc'],
			category: 'config',
			description: {
				content: 'Configure the what channel you want the bot to send a message in when someone joins the server.',
				usage: 'welcomechannel [channel]',
				examples: ['welcomechannel #welcome']
			},
			clientPermissions: ['SEND_MESSAGES'],
			ownerOnly: true
		});
	}
	public async exec(message: BushMessage, args: { action: 'add' | 'remove'; user: User }): Promise<unknown> {
		if (!this.client.config.owners.includes(message.author.id))
			return await message.util.reply(`${this.client.util.emojis.error} Only my developers can run this command...`);

		const superUsers = (await Global.findByPk(this.client.config.dev ? 'development' : 'production')).superUsers;
		let success;
		if (args.action === 'add') {
			if (superUsers.includes(args.user.id)) {
				return message.util.reply(`${this.client.util.emojis.warn} \`${args.user.tag}\` is already a superuser.`);
			}
			success = await this.client.util.insertOrRemoveFromGlobal('add', 'superUsers', args.user.id).catch(() => false);
		} else {
			if (!superUsers.includes(args.user.id)) {
				return message.util.reply(`${this.client.util.emojis.warn} \`${args.user.tag}\` is not superuser.`);
			}
			success = await this.client.util.insertOrRemoveFromGlobal('remove', 'superUsers', args.user.id).catch(() => false);
		}
		if (success) {
			const responses = [args.action == 'remove' ? `` : 'made', args.action == 'remove' ? 'is no longer' : ''];
			return message.util.reply(
				`${this.client.util.emojis.success} ${responses[0]} \`${args.user.tag}\` ${responses[1]} a superuser.`
			);
		} else {
			const response = [args.action == 'remove' ? `removing` : 'making', args.action == 'remove' ? `from` : 'to'];
			return message.util.reply(
				`${this.client.util.emojis.error} There was an error ${response[0]} \`${args.user.tag}\` ${response[1]} the superuser list.`
			);
		}
	}
}
