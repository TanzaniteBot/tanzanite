import { Message, TextChannel, NewsChannel } from 'discord.js';
import { BushCommand } from '../../lib/extensions/BushCommand';
import { Argument } from 'discord-akairo';

export default class LockDownCommand extends BushCommand {
	public constructor() {
		super('lockdown', {
			aliases: ['lockdown', 'lock'],
			category: "Moulberry's Bush",
			description: {
				content: 'A command to quickly prevent certain roles from talking in channels.',
				usage: 'lockdown [channel|all|public]',
				examples: ['lockdown #general']
			},
			clientPermissions: ['MANAGE_CHANNELS', 'SEND_MESSAGES'],
			userPermissions: ['MANAGE_MESSAGES'],
			args: [
				{
					id: 'channel',
					type: Argument.union('channels', 'all', 'public'),
					prompt: {
						start: 'What channel(s) would you like to lock?',
						retry: '<:no:787549684196704257> choose a valid channel to lock.',
						optional: true
					},
					default: m => m.channel
				}
				// {
				// 	id: 'allowedRoles',
				// 	type: 'roles'
				// }
			],
			channel: 'guild',
			hidden: true
		});
	}
	public exec(message: Message, { channel /* allowedRoles */ }: { channel: TextChannel | NewsChannel | 'all' | 'public' /* ; allowedRoles: Role[] */ }): Promise<Message> {
		const publicChannels = [
			'832652653292027904', //general
			'702456294874808330', //bot-commands
			'766209671882080256', //programming
			'737466379699224597', //suggestions
			'714332750156660756', //neu-support-1
			'737414807250272258', //neu-support-2
			'693600396492537896', //neu-suggestions
			'822767650450047006' //schematics-for-moulberry-tm-dungeons
		];
		if (message.channel.type === 'dm') return message.util.reply('<:no:787549684196704257> This command cannot be run in DMs.');
		if (message.channel.guild.id !== '516977525906341928') return message.util.reply("<:no:787549684196704257> This command can only be run in Moulberry's Bush.");
		return message.util.reply('<:no:787549684196704257> This command is not finished.');
	}
}
