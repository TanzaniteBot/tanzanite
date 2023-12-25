import {
	BotCommand,
	ButtonPaginator,
	chunk,
	colors,
	emojis,
	formatList,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType, escapeMarkdown, type CommandInteraction, type Role } from 'discord.js';
import assert from 'node:assert/strict';

export default class WhoHasRoleCommand extends BotCommand {
	public constructor() {
		super('whoHasRole', {
			aliases: ['who-has-role', 'whr', 'dump'],
			category: 'utilities',
			description: 'Allows you to view what users have a certain role.',
			usage: ['who-has-role <...roles>'],
			examples: ['who-has-role admin'],
			args: new Array(25).fill(0).map(
				(_, i) =>
					({
						id: `role${i + 1}`,
						description: i === 0 ? 'The role to find the users of.' : 'Another role that the user must have.',
						type: 'role',
						prompt: i === 0 ? 'What role would you like to find the users of?' : 'What other role should the user also have?',
						retry: '{error} Choose a valid role.',
						slashType: ApplicationCommandOptionType.Role,
						optional: i !== 0
					}) as const
			),
			slash: true,
			channel: 'guild',
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: [],
			typing: true
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: {
			[K in `role${NumberRange}`]: OptArgType<'role'>;
		}
	) {
		assert(message.inGuild());
		if (message.util.isSlash) await (message.interaction as CommandInteraction).deferReply();

		const rawRoles = Object.values(args).filter((v) => v !== null) as Role[];
		const roles = rawRoles.map((v) => v.id);

		const members = message.guild.members.cache.filter((m) => roles.every((r) => m.roles.cache.has(r)));

		const roleMembers = members.map((member) => `${member.user} (${escapeMarkdown(member.user.tag)})`);
		const chunkedRoleMembers = chunk(roleMembers, 30);

		const title = `Members with ${
			roles.length < 4
				? formatList(
						rawRoles.map((r) => r.name),
						'and'
					)
				: `${rawRoles.length} Roles`
		} [\`${members.size.toLocaleString()}\`]`;
		const color = colors.default;
		const embedPages = chunkedRoleMembers.map((chunk) => ({
			title,
			description: chunk.join('\n'),
			color
		}));

		if (embedPages.length === 0) {
			return await message.util.reply(`${emojis.error} No members found matching the given roles.`);
		}

		return await ButtonPaginator.send(message, embedPages);
	}
}

type Mapped<N extends number, Result extends Array<unknown> = []> = Result['length'] extends N
	? Result
	: Mapped<N, [...Result, Result['length']]>;

type NumberRange = Exclude<Mapped<25>[number], 0 | 1>;
