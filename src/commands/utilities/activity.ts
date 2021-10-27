import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { DiscordAPIError, Message, VoiceChannel } from 'discord.js';

const activityMap = {
	'Poker Night': '755827207812677713',
	'Betrayal.io': '773336526917861400',
	'Fishington.io': '814288819477020702',
	'YouTube Together': '755600276941176913',
	'Chess in the Park': '832012774040141894',
	'Watch Together': '880218394199220334',
	'Doodle Crew': '878067389634314250',
	'Wood Snacks': '879863976006127627',
	'Letter Tile': '879863686565621790'
};

function map(phase: string) {
	if (client.consts.regex.snowflake.test(phase)) return phase;
	else if (Reflect.has(activityMap, phase)) return activityMap[phase as keyof typeof activityMap];
	else if (['yt', 'youtube'].includes(phase)) return activityMap['Watch Together'];
	else if (['chess', 'park'].includes(phase)) return activityMap['Chess in the Park'];
	else if (['poker'].includes(phase)) return activityMap['Poker Night'];
	else if (['fish', 'fishing', 'fishington'].includes(phase)) return activityMap['Fishington.io'];
	else if (['betrayal'].includes(phase)) return activityMap['Betrayal.io'];
	else if (['doodle-crew', 'doodle'].includes(phase)) return activityMap['Doodle Crew'];
	else if (['wood-snacks', 'wood'].includes(phase)) return activityMap['Wood Snacks'];
	else if (['letter-tile', 'letter'].includes(phase)) return activityMap['Letter Tile'];
	else return null;
}

const activityTypeCaster = (_message: Message | BushMessage | BushSlashMessage, phrase: string) => {
	if (!phrase) return null;
	const mappedPhrase = map(phrase);
	if (mappedPhrase) return mappedPhrase;
	return null;
};

export default class YouTubeCommand extends BushCommand {
	constructor() {
		super('activity', {
			aliases: [
				'activity',
				'yt',
				'youtube',
				'chess',
				'park',
				'poker',
				'fish',
				'fishing',
				'fishington',
				'betrayal',
				'doodle-crew',
				'doodle',
				'wood-snacks',
				'wood',
				'letter-tile',
				'letter'
			],
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
					customType: activityTypeCaster,
					prompt: {
						start: 'What activity would you like to play?',
						retry:
							'{error} You must choose one of the following options: `yt`, `youtube`, `chess`, `park`, `poker`, `fish`, `fishing`, `fishington`, or `betrayal`.'
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
				},
				{
					name: 'activity',
					description: 'What activity would you like to play?',
					type: 'STRING',
					required: true,
					choices: Object.keys(activityMap).map((key) => ({ name: key, value: activityMap[key as keyof typeof activityMap] }))
				}
			],
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, args: { channel: VoiceChannel; activity: string }) {
		const channel = typeof args.channel === 'string' ? message.guild?.channels.cache.get(args.channel) : args.channel;
		if (!channel || channel.type !== 'GUILD_VOICE')
			return await message.util.reply(`${util.emojis.error} Choose a valid voice channel`);

		const target_application_id = message.util.isSlash ? args.activity : activityTypeCaster(message, args.activity);

		let response: string;
		const invite = await (client as any).api
			.channels(channel.id)
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
			.catch((e: Error | DiscordAPIError) => {
				if ((e as DiscordAPIError).code === 50013) {
					response = `${util.emojis.error} I am missing permissions to make an invite in that channel.`;
					return;
				} else response = `${util.emojis.error} An error occurred while generating your invite: ${e?.message ?? e}`;
			});
		if (response! || !invite || !invite.code)
			return await message.util.reply(
				response! ?? `${util.emojis.error} An unknown error occurred while generating your invite.`
			);
		else return await message.util.send(`https://discord.gg/${invite.code}`);
	}
}
