import { AllowedMentions, BushCommand, Highlight, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
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
		const target: ArgType<'member'> | ArgType<'channel'> = yield {
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

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { target: string | ArgType<'member'> | ArgType<'channel'> }
	) {
		assert(message.inGuild());

		args.target =
			typeof args.target === 'string'
				? (await util.arg.cast(util.arg.union('member', 'channel'), message, args.target))!
				: args.target;

		if (!args.target || !(args.target instanceof GuildMember || args.target instanceof Channel))
			return await message.util.reply(`${util.emojis.error} You can only block users or channels.`);

		if (args.target instanceof Channel && !args.target.isTextBased())
			return await message.util.reply(`${util.emojis.error} You can only block text-based channels.`);

		const [highlight] = await Highlight.findOrCreate({
			where: { guild: message.guild.id, user: message.author.id }
		});

		const key = `blacklisted${args.target instanceof Channel ? 'Channels' : 'Users'}` as const;

		if (highlight[key].includes(args.target.id))
			return await message.util.reply({
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				content: `${util.emojis.error} You have already blocked ${args.target}.`,
				allowedMentions: AllowedMentions.none()
			});

		highlight[key] = util.addToArray(highlight[key], args.target.id);
		await highlight.save();

		return await message.util.reply({
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			content: `${util.emojis.success} Successfully blocked ${args.target} from triggering your highlights.`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
