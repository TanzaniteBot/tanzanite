import { AllowedMentions, BushCommand, emojis, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import assert from 'assert';
import { Argument, ArgumentGeneratorReturn } from 'discord-akairo';
import { Channel, GuildMember, User } from 'discord.js';
import { BlockResult } from '../../lib/common/HighlightManager.js';
import { highlightSubcommands } from './highlight-!.js';

export default class HighlightBlockCommand extends BushCommand {
	public constructor() {
		super('highlight-block', {
			aliases: [],
			category: 'utilities',
			description: highlightSubcommands.block.description,
			usage: [],
			examples: [],
			clientPermissions: [],
			userPermissions: []
		});
	}

	public override *args(): ArgumentGeneratorReturn {
		const target: ArgType<'member' | 'textBasedChannel'> = yield {
			type: Argument.union('member', 'textBasedChannel'),
			match: 'rest',
			prompt: {
				start: highlightSubcommands.block.options[0].start,
				retry: highlightSubcommands.block.options[0].options[0].retry,
				optional: !highlightSubcommands.block.options[0].options[0].required
			}
		};

		return { target };
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { target: ArgType<'member' | 'textBasedChannel'> }) {
		assert(message.inGuild());

		if (args.target instanceof User && message.util.isSlashMessage(message))
			args.target = message.interaction.options.getMember('target')!;

		if (!args.target) return message.util.reply(`${emojis.error} Could not resolve member.`);

		if (!args.target || !(args.target instanceof GuildMember || args.target instanceof Channel))
			return await message.util.reply(`${emojis.error} You can only block users or channels.`);

		if (args.target instanceof Channel && !args.target.isTextBased())
			return await message.util.reply(`${emojis.error} You can only block text-based channels.`);

		const res = await this.client.highlightManager.addBlock(message.guildId, message.author.id, args.target);

		/* eslint-disable @typescript-eslint/no-base-to-string */
		const content = (() => {
			switch (res) {
				case BlockResult.ALREADY_BLOCKED:
					return `${emojis.error} You have already blocked ${args.target}.`;
				case BlockResult.ERROR:
					return `${emojis.error} An error occurred while blocking ${args.target}.`;
				case BlockResult.SUCCESS:
					return `${emojis.success} Successfully blocked ${args.target} from triggering your highlights.`;
			}
		})();
		/* eslint-enable @typescript-eslint/no-base-to-string */

		return await message.util.reply({ content, allowedMentions: AllowedMentions.none() });
	}
}
