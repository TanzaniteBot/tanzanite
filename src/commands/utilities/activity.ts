import { ArgType, BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import { DiscordAPIError, Message } from 'discord.js';

const activityMap = {
	'Poker Night': {
		id: '755827207812677713',
		aliases: ['poker']
	},
	'Betrayal.io': {
		id: '773336526917861400',
		aliases: ['betrayal']
	},
	'Fishington.io': {
		id: '814288819477020702',
		aliases: ['fish', 'fishing', 'fishington']
	},
	'YouTube Together': {
		id: '755600276941176913',
		aliases: ['youtube-together']
	},
	'Chess In The Park': {
		id: '832012774040141894',
		aliases: ['chess']
	},
	'Watch Together': {
		id: '880218394199220334',
		aliases: ['watch-together', 'yt', 'youtube']
	},
	'Doodle Crew': {
		id: '878067389634314250',
		aliases: ['doodle-crew', 'doodle']
	},
	'Wood Snacks': {
		id: '879863976006127627',
		aliases: ['wood-snacks', 'wood']
	},
	'Letter Tile': {
		id: '879863686565621790',
		aliases: ['letter-tile', 'letter']
	},
	'Spell Cast': {
		id: '852509694341283871',
		aliases: ['spell-cast', 'spell', 'cast']
	},
	'Checkers In The Park': {
		id: '832013003968348200',
		aliases: ['checkers']
	}
};

function map(phase: string) {
	if (client.consts.regex.snowflake.test(phase)) return phase;
	else if (phase in activityMap) return activityMap[phase as keyof typeof activityMap];

	for (const activity in activityMap) {
		if (activityMap[activity as keyof typeof activityMap].aliases.includes(phase.toLowerCase()))
			return activityMap[activity as keyof typeof activityMap].id;
	}

	return null;
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
			description: 'Allows you to play discord activities in voice channels.',
			usage: [
				`activity <channel> <${Object.values(activityMap)
					.flatMap((a) => a.aliases)
					.map((a) => `'${a}'`)
					.join('|')}>`,
				'yt <channel>' // you do not need to specify the activity if you use its alias.
			],
			examples: ['yt 785281831788216364', 'activity 785281831788216364 yt'],
			args: [
				{
					id: 'channel',
					description: 'The channel to create the activity in.',
					type: 'voiceChannel',
					prompt: 'What channel would you like to use?',
					retry: '{error} Choose a valid voice channel',
					slashType: 'CHANNEL',
					channelTypes: ['GUILD_VOICE']
				},
				{
					id: 'activity',
					description: 'The activity to create an invite for.',
					match: 'rest',
					type: activityTypeCaster,
					prompt: 'What activity would you like to play?',
					retry: `{error} You must choose one of the following options: ${Object.values(activityMap)
						.flatMap((a) => a.aliases)
						.map((a) => `\`${a}\``)
						.join(', ')}.`,
					slashType: 'STRING',
					choices: Object.keys(activityMap).map((key) => ({
						name: key,
						value: activityMap[key as keyof typeof activityMap].id
					}))
				}
			],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, args: { channel: ArgType<'channel'>; activity: string }) {
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
