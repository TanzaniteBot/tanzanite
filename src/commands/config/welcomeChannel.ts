import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { Channel } from 'discord.js';

export default class WelcomeChannelCommand extends BushCommand {
	public constructor() {
		super('welcomeChannel', {
			aliases: ['welcomechannel', 'wc'],
			category: 'config',
			description: {
				content: 'Configure the what channel you want BushBot to send a message in when someone joins the server.',
				usage: 'welcomechannel [channel]',
				examples: ['welcomechannel #welcome']
			},
			args: [
				{
					id: 'channel',
					type: 'channel',
					prompt: {
						start: 'What channel would you like me to send welcome messages in?',
						retry: '{error} Choose a valid channel',
						optional: true
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'channel',
					description: 'What channel would you like me to send welcome messages in?',
					type: 'CHANNEL',
					required: false
				}
			],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD']
		});
	}
	public override async exec(message: BushMessage | BushSlashMessage, args: { channel: Channel }): Promise<unknown> {
		const oldChannel = await message.guild.getSetting('welcomeChannel');
		await message.guild.setSetting('welcomeChannel', args.channel.id ?? undefined);
		if (args.channel) {
			return await message.util.send(
				`${util.emojis.success} changed the server's welcome channel ${oldChannel ? `from <#${oldChannel}>` : ''} to <#${
					args.channel.id
				}>.`
			);
		} else {
			return await message.util.send(`${util.emojis.success} removed the server's welcome channel.`);
		}
	}
}
