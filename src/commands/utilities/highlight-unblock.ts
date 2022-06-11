import { AllowedMentions, BushCommand, Highlight, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import { Argument, ArgumentGeneratorReturn } from 'discord-akairo';
import { Channel, GuildMember } from 'discord.js';
import { highlightCommandArgs, highlightSubcommands } from './highlight-!.js';

export default class HighlightUnblockCommand extends BushCommand {
	public constructor() {
		super('highlight-unblock', {
			aliases: [],
			category: 'utilities',
			description: highlightSubcommands.unblock,
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
				start: highlightCommandArgs.unblock[0].description,
				retry: highlightCommandArgs.unblock[0].retry,
				optional: !highlightCommandArgs.unblock[0].required
			}
		};

		return { target };
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { target: ArgType<'user'> | ArgType<'role'> | ArgType<'member'> }
	) {
		assert(message.inGuild());

		if (!(args.target instanceof GuildMember || args.target instanceof Channel))
			return await message.util.reply(`${util.emojis.error} You can only unblock users or channels.`);

		if (args.target instanceof Channel && !args.target.isTextBased())
			return await message.util.reply(`${util.emojis.error} You can only unblock text-based channels.`);

		const [highlight] = await Highlight.findOrCreate({
			where: { guild: message.guild.id, user: message.author.id }
		});

		const key = `blacklisted${args.target instanceof Channel ? 'Channels' : 'Users'}` as const;

		if (!highlight[key].includes(args.target.id))
			return await message.util.reply({
				content: `${util.emojis.error} ${args.target} is not blocked so cannot be unblock.`,
				allowedMentions: AllowedMentions.none()
			});

		highlight[key] = util.removeFromArray(highlight[key], args.target.id);
		await highlight.save();

		return await message.util.reply({
			content: `${util.emojis.success} Successfully allowed ${args.target} to trigger your highlights.`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
