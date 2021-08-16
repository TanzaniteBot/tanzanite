import { VoiceChannel } from 'discord.js';
import { BushCommand, BushMessage, BushSlashMessage } from '../../lib';

const activityMap = {
	'Poker Night': '755827207812677713',
	'Betrayal.io': '773336526917861400',
	'Fishington.io': '814288819477020702',
	'YouTube Together': '755600276941176913',
	'Chess in the Park': '832012774040141894'
};

function map(phase) {
	if (['yt', 'youtube'].includes(phase)) return activityMap['YouTube Together'];
	else if (['chess', 'park'].includes(phase)) return activityMap['Chess in the Park'];
	else if (['poker'].includes(phase)) return activityMap['Poker Night'];
	else if (['fish', 'fishing', 'fishington'].includes(phase)) return activityMap['Fishington.io'];
	else if (['betrayal'].includes(phase)) return activityMap['Betrayal.io'];
	else return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const activityTypeCaster = (_message: BushMessage, phrase: string) => {
	if (!phrase) return null;
	const mappedPhrase = map(phrase);
	if (mappedPhrase) return mappedPhrase;
	return null;
};

export default class YouTubeCommand extends BushCommand {
	constructor() {
		super('activity', {
			aliases: ['activity', 'yt', 'youtube', 'chess', 'park', 'poker', 'fish', 'fishing', 'fishington', 'betrayal'],
			category: 'utilities',
			description: {
				content: 'Allows you to play discord activities in voice channels.',
				usage: [
					'activity <channel> <`yt`|`youtube`|`chess`|`park`|`poker`|`fish`|`fishing`|`fishington`|`betrayal`>',
					'yt <channel>' // you do not need to specify the activity if you use its alias.
				],
				examples: ['yt 785281831788216364', 'activity 785281831788216364 yt']
			},
			args: [
				{
					id: 'channel',
					type: 'voiceChannel',
					prompt: {
						start: 'What channel would you like to use?',
						retry: '{error} Choose a valid voice channel'
					}
				},
				{
					id: 'activity',
					match: 'rest',
					customType: activityTypeCaster
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'channel',
					description: 'What channel would you like to use?',
					type: 'CHANNEL',
					required: true
				},
				{
					name: 'activity',
					description: 'What activity would you like to play?',
					type: 'STRING',
					required: true,
					choices: [
						{ name: 'Poker Night', value: '755827207812677713' },
						{ name: 'Betrayal.io', value: '773336526917861400' },
						{ name: 'Fishington.io', value: '814288819477020702' },
						{ name: 'YouTube Together', value: '755600276941176913' },
						{ name: 'Chess in the Park', value: '832012774040141894' }
					]
				}
			],
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES']
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { channel: VoiceChannel; activity: string }
	): Promise<unknown> {
		if (!args.channel?.id || args.channel?.type != 'GUILD_VOICE')
			return await message.util.reply(`${util.emojis.error} Choose a valid voice channel`);

		let target_application_id: string;
		if (message.util.isSlash) target_application_id = args.activity;
		else target_application_id = target_application_id = args.activity;

		// @ts-ignore: jank typings
		// prettier-ignore
		const invite = await this.client.api.channels(args.channel.id)
				.invites.post({
					data: {
						validate: null,
						max_age: 604800,
						max_uses: 0,
						target_type: 2,
						target_application_id,
						temporary: false
					}
				})
				.catch(() => false);
		if (!invite || !invite.code)
			return await message.util.reply(`${this.client.util.emojis.error} An error occurred while generating your invite.`);
		else return await message.util.send(`https://discord.gg/${invite.code}`);
	}
}
