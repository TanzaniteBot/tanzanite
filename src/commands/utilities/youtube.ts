import { VoiceChannel } from 'discord.js';
import { BushCommand, BushMessage, BushSlashMessage } from '../../lib';

export default class YouTubeCommand extends BushCommand {
	constructor() {
		super('youtube', {
			aliases: ['youtube', 'yt'],
			category: 'utilities',
			description: {
				content: "Allows the user to have access to discord's in-app YouTube experiment.",
				usage: 'yt <channel>',
				examples: ['yt 785281831788216364']
			},
			args: [
				{
					id: 'channel',
					type: 'voiceChannel',
					prompt: {
						start: 'What channel would you like to use?',
						retry: '{error} Choose a valid voice channel'
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'channel',
					description: 'What channel would you like to use?',
					type: 'CHANNEL',
					required: true
				}
			],
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES']
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, args: { channel: VoiceChannel }): Promise<unknown> {
		if (!args.channel?.id || args.channel?.type != 'GUILD_VOICE')
			return await message.util.reply(`${util.emojis.error} Choose a valid voice channel`);

		// @ts-ignore: jank typings
		// prettier-ignore
		const invite = await this.client.api.channels(args.channel.id).invites.post({
			data: {
				validate: null,
				max_age: 604800,
				max_uses: 0,
				target_type: 2,
				target_application_id: '755600276941176913',
				temporary: false
			}
		})
		.catch(() => {});
		if (!invite || !invite.code)
			return await message.util.reply(`${this.client.util.emojis.error} An error occurred while generating your invite.`);
		else return await message.util.send(`https://discord.gg/${invite.code}`);
	}
}
