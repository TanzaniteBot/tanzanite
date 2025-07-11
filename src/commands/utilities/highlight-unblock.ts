import { AllowedMentions, BotCommand, emojis, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import { HighlightUnblockResult } from '#lib/common/HighlightManager.js';
import { Argument, type ArgumentGeneratorReturn } from '@tanzanite/discord-akairo';
import { BaseChannel, GuildMember, User } from 'discord.js';
import assert from 'node:assert/strict';
import { highlightSubcommands } from './highlight-!.js';

export default class HighlightUnblockCommand extends BotCommand {
	public constructor() {
		super('highlight-unblock', {
			aliases: [],
			category: 'utilities',
			description: highlightSubcommands.unblock.description,
			usage: [],
			examples: [],
			clientPermissions: [],
			userPermissions: []
		});
	}

	public override *args(): ArgumentGeneratorReturn {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const target: ArgType<'member' | 'textBasedChannel'> = yield {
			type: Argument.union('member', 'textBasedChannel'),
			match: 'rest',
			prompt: {
				start: highlightSubcommands.unblock.options[0].start,
				retry: highlightSubcommands.unblock.options[0].options[0].retry,
				optional: !highlightSubcommands.unblock.options[0].options[0].retry
			}
		};

		return { target };
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { target: ArgType<'member' | 'textBasedChannel'> }) {
		assert(message.inGuild());

		if (args.target instanceof User && message.util.isSlashMessage(message))
			args.target = message.interaction.options.getMember('target')!;

		if (args.target == null) return message.util.reply(`${emojis.error} Could not resolve member.`);

		if (!(args.target instanceof GuildMember || args.target instanceof BaseChannel))
			return await message.util.reply(`${emojis.error} You can only unblock users or channels.`);

		if (args.target instanceof BaseChannel && !args.target.isTextBased())
			return await message.util.reply(`${emojis.error} You can only unblock text-based channels.`);

		const res = await this.client.highlightManager.removeBlock(message.guildId, message.author.id, args.target);

		const content = (() => {
			switch (res) {
				case HighlightUnblockResult.NOT_BLOCKED:
					return `${emojis.error} ${args.target} is not blocked so cannot be unblock.`;
				case HighlightUnblockResult.ERROR:
					return `${emojis.error} An error occurred while unblocking ${args.target}.`;
				case HighlightUnblockResult.SUCCESS:
					return `${emojis.success} Successfully allowed ${args.target} to trigger your highlights.`;
			}
		})();

		return await message.util.reply({ content, allowedMentions: AllowedMentions.none() });
	}
}
