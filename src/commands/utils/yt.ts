import { VoiceChannel } from 'discord.js';
import { BotCommand } from '../../lib/extensions/BotCommand';
import { Message } from 'discord.js';

// shhh don't tell geek
export default class YTCommand extends BotCommand {
	constructor() {
		super('yt', {
			aliases: ['yt'],
			category: 'utils',
			description: {
				content: 'bypass yt experiment',
				usage: 'yt <channel>',
				examples: ['yt 785281831788216364']
			},
			args: [
				{
					id: 'channel',
					type: 'voiceChannel',
					prompt: {
						start: 'What channel would you like to use?',
						retry: '<:no:787549684196704257> Choose a valid voice channel'
					}
				}
			],
			clientPermissions: ['SEND_MESSAGES']
		});
	}

	async exec(message: Message, args: { channel: VoiceChannel }): Promise<Message> {
		if (!args.channel?.id || args.channel?.type != 'voice') return message.reply('<:no:787549684196704257> Choose a valid voice channel');

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const invite = await this.client.api
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.channels(args.channel.id)
			.invites.post({
				data: {
					validate: null,
					max_age: 604800,
					max_uses: 0,
					target_type: 2,
					target_application_id: '755600276941176913',
					temporary: false
				}
			})
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			.catch(() => {});
		if (!invite?.code) return message.reply('An Error has occurred.');
		else return message.channel.send(`https://discord.gg/${invite.code}`);
	}
}
