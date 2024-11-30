import {
	BotCommand,
	emojis,
	regex,
	type ArgType,
	type BotArgumentTypeCaster,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import type { ArgumentGeneratorReturn, ArgumentTypeCaster } from '@tanzanite/discord-akairo';
import { ApplicationCommandOptionType, ChannelType, type DiscordAPIError, type Snowflake } from 'discord.js';

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

interface Activity {
	id: Snowflake;
	aliases: string[];
}

function map(phase: string): Activity | null {
	if (regex.snowflake.test(phase)) return { id: phase, aliases: [] };
	else if (phase in activityMap) return activityMap[phase as keyof typeof activityMap];

	for (const activity in activityMap) {
		if (activityMap[activity as keyof typeof activityMap].aliases.includes(phase.toLowerCase()))
			return activityMap[activity as keyof typeof activityMap];
	}

	return null;
}

const activityTypeCaster: BotArgumentTypeCaster<Snowflake | null> = (message: CommandMessage, phrase: string) => {
	const parsedPhrase = (phrase ?? message.util.parsed?.alias !== 'activity') ? message.util.parsed?.alias : undefined;
	if (!parsedPhrase) return null;
	const mappedPhrase = map(parsedPhrase)?.id;
	return mappedPhrase ?? null;
};

export default class ActivityCommand extends BotCommand {
	public constructor() {
		super('activity', {
			aliases: ['activity', ...Object.values(activityMap).flatMap((a) => a.aliases)],
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
					slashType: ApplicationCommandOptionType.Channel,
					channelTypes: [ChannelType.GuildVoice],
					only: 'slash'
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
					slashType: ApplicationCommandOptionType.String,
					choices: Object.keys(activityMap).map((key) => ({
						name: key,
						value: activityMap[key as keyof typeof activityMap].id
					}))
				}
			],
			slash: true,
			clientPermissions: [],
			userPermissions: []
		});
	}

	public override *args(message: CommandMessage): ArgumentGeneratorReturn {
		const channel: ArgType<'voiceChannel'> = yield {
			id: 'channel',
			description: 'The channel to create the activity in.',
			type: 'voiceChannel',
			prompt: {
				start: 'What channel would you like to use?',
				retry: '{error} Choose a valid voice channel'
			}
		};

		const activity: string = yield {
			id: 'activity',
			description: 'The activity to create an invite for.',
			match: 'rest',
			type: <ArgumentTypeCaster>activityTypeCaster,
			prompt: {
				start: 'What activity would you like to play?',
				retry: `{error} You must choose one of the following options: ${Object.values(activityMap)
					.flatMap((a) => a.aliases)
					.map((a) => `\`${a}\``)
					.join(', ')}.`,
				optional: !!(message.util.parsed && message.util.parsed?.alias !== 'activity')
			},
			default: message.util.parsed?.alias !== 'activity' ? message.util.parsed?.alias : undefined
		};

		return { channel, activity };
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { channel: ArgType<'voiceChannel'>; activity: string }
	) {
		const channel = typeof args.channel === 'string' ? message.guild?.channels.cache.get(args.channel) : args.channel;
		if (channel?.type !== ChannelType.GuildVoice) return await message.util.reply(`${emojis.error} Choose a valid voice channel`);

		const target_application_id = message.util.isSlashMessage(message)
			? args.activity
			: activityTypeCaster(message, args.activity);

		let response: string;
		const invite: any = await this.client.rest
			.post(`/channels/${channel.id}/invites`, {
				body: {
					validate: null,
					max_age: 604800,
					max_uses: 0,
					target_type: 2,
					target_application_id,
					temporary: false
				}
			})

			.catch((e: Error | DiscordAPIError) => {
				if ((e as DiscordAPIError)?.code === 50013) {
					response = `${emojis.error} I am missing permissions to make an invite in that channel.`;
					return;
				} else response = `${emojis.error} An error occurred while generating your invite: ${e?.message ?? e}`;
			});
		if (response! || !invite || !invite.code)
			return await message.util.reply(response! ?? `${emojis.error} An unknown error occurred while generating your invite.`);
		else return await message.util.send(`https://discord.gg/${invite.code}`);
	}
}
