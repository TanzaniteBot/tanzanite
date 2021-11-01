import { BushCommand, type BushMessage, type BushNewsChannel, type BushSlashMessage, type BushTextChannel } from '@lib';

export default class LockdownCommand extends BushCommand {
	public constructor() {
		super('lockdown', {
			aliases: ['lockdown', 'unlockdown'],
			category: 'moderation',
			description: {
				content: 'Allows you to lockdown a channel or all configured channels..',
				usage: ['lockdown [--all]'],
				examples: ['lockdown', 'lockdown --all']
			},
			args: [
				{
					id: 'all',
					match: 'flag',
					flag: '--all'
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'all',
					description: 'Would you like to lockdown all channels?',
					type: 'BOOLEAN',
					required: false
				}
			],
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: [],
			hidden: true
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, args: { all: boolean }) {
		return await message.util.reply('Unfortunately my developer is too lazy to implement this command.');
		if (!args.all) {
			if (!['GUILD_TEXT', 'GUILD_NEWS'].includes(message.channel!.type))
				return message.util.reply(`${util.emojis.error} You can only lock down text and announcement channels.`);

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const lockdownSuccess = await util.lockdownChannel({
				channel: message.channel as BushTextChannel | BushNewsChannel,
				moderator: message.author
			});
		}
	}
}
