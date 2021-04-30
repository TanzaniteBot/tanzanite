import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message, TextChannel, NewsChannel } from 'discord.js';
import { Argument } from 'discord-akairo';

export default class UnLockDownCommand extends BushCommand {
	public constructor() {
		super('unlockdown', {
			aliases: ['unlockdown', 'unlock'],
			category: "Moulberry's Bush",
			description: {
				content: 'A command to quickly unlock (a) channel(s).',
				usage: 'unlockdown [channel|all|public]',
				examples: ['unlockdown #general']
			},
			clientPermissions: ['MANAGE_CHANNELS', 'SEND_MESSAGES'],
			userPermissions: ['MANAGE_MESSAGES'],
			args: [
				{
					id: 'channel',
					type: Argument.union('channels', 'all', 'public'),
					prompt: {
						start: 'What channel(s) would you like to unlock?',
						retry: '<:error:837123021016924261> choose a valid channel to unlock.',
						optional: true
					},
					default: m => m.channel
				}
			],
			channel: 'guild',
			hidden: true
		});
	}
	public exec(message: Message, { channel }: { channel: TextChannel | NewsChannel | 'all' | 'public' }): Promise<Message> {
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
		if (message.channel.type === 'dm') return message.util.reply('<:error:837123021016924261> This command cannot be run in DMs.');
		if (message.channel.guild.id !== '516977525906341928' && !this.client.ownerID.includes(message.author.id)) {
			return message.util.reply("<:error:837123021016924261> This command can only be run in Moulberry's Bush.");
		}
		return message.util.reply('<:error:837123021016924261> This command is not finished.');
	}
}