import {
	addToArray,
	AllowedMentions,
	Arg,
	BushCommand,
	emojis,
	Highlight,
	type ArgType,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import assert from 'assert';
import { Argument, ArgumentGeneratorReturn } from 'discord-akairo';
import { Channel, GuildMember } from 'discord.js';
import { highlightCommandArgs, highlightSubcommands } from './highlight-!.js';

export default class HighlightBlockCommand extends BushCommand {
	public constructor() {
		super('highlight-block', {
			aliases: [],
			category: 'utilities',
			description: highlightSubcommands.block,
			usage: [],
			examples: [],
			clientPermissions: [],
			userPermissions: []
		});
	}

	public override *args(): ArgumentGeneratorReturn {
		const target: ArgType<'member' | 'channel'> = yield {
			type: Argument.union('member', 'channel'),
			match: 'rest',
			prompt: {
				start: highlightCommandArgs.block[0].description,
				retry: highlightCommandArgs.block[0].retry,
				optional: !highlightCommandArgs.block[0].required
			}
		};

		return { target };
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { target: string | ArgType<'member' | 'channel'> }) {
		assert(message.inGuild());

		args.target =
			typeof args.target === 'string' ? (await Arg.cast(Arg.union('member', 'channel'), message, args.target))! : args.target;

		if (!args.target || !(args.target instanceof GuildMember || args.target instanceof Channel))
			return await message.util.reply(`${emojis.error} You can only block users or channels.`);

		if (args.target instanceof Channel && !args.target.isTextBased())
			return await message.util.reply(`${emojis.error} You can only block text-based channels.`);

		const [highlight] = await Highlight.findOrCreate({
			where: { guild: message.guild.id, user: message.author.id }
		});

		const key = `blacklisted${args.target instanceof Channel ? 'Channels' : 'Users'}` as const;

		if (highlight[key].includes(args.target.id))
			return await message.util.reply({
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				content: `${emojis.error} You have already blocked ${args.target}.`,
				allowedMentions: AllowedMentions.none()
			});

		highlight[key] = addToArray(highlight[key], args.target.id);
		await highlight.save();

		return await message.util.reply({
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			content: `${emojis.success} Successfully blocked ${args.target} from triggering your highlights.`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
