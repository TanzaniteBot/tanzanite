import {
	BotCommand,
	ModLog,
	TanzaniteEvent,
	colors,
	emojis,
	overflowEmbed,
	regex,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';
import assert from 'node:assert/strict';
import EvidenceCommand from './evidence.js';

export default class MassEvidenceCommand extends BotCommand {
	public constructor() {
		super('massEvidence', {
			aliases: ['mass-evidence'],
			category: 'moderation',
			description: 'Add evidence to the last punishment of multiple users.',
			usage: ['mass-ban <...users> [--evidence "<evidence>"]'],
			examples: [
				'mass-evidence 311294982898057217 792202575851814942 792199864510447666 792201010118131713 --evidence "ironmoon said so"'
			],
			args: [
				{
					id: 'users',
					description: 'The ids of users to add evidence to each of their last punishment.',
					type: 'string',
					match: 'rest',
					prompt: 'What are the ids of all the users you would like add evidence to their last punishment?',
					retry: '{error} Choose a valid list of user ids to add evidence to their last punishment.',
					slashType: ApplicationCommandOptionType.String
				},
				{
					id: 'evidence',
					description: 'The evidence for the punishment.',
					flag: ['--evidence'],
					match: 'option',
					prompt: 'What is the evidence for the punishment?',
					retry: '{error} Provide valid evidence for the punishment.',
					optional: true,
					slashType: ApplicationCommandOptionType.String
				}
			],
			quoted: true,
			slash: true,
			channel: 'guild',
			clientPermissions: ['EmbedLinks'],
			userPermissions: ['ManageMessages'],
			lock: 'user'
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { users: ArgType<'string'>; evidence: OptArgType<'string'> }
	) {
		assert(message.inGuild());

		const evidence = EvidenceCommand.getEvidence(message, args.evidence);
		if (evidence == null) return;

		const ids = args.users.split(/\n| /).filter((id) => id.length > 0);
		if (ids.length === 0) return message.util.send(`${emojis.error} You must provide at least one user id.`);
		for (const id of ids) {
			if (!regex.snowflake.test(id)) return message.util.send(`${emojis.error} ${id} is not a valid snowflake.`);
		}

		const caseMap = (
			await Promise.all(
				ids.map((id) =>
					ModLog.findOne({
						where: { guild: message.guild.id, user: id },
						order: [['createdAt', 'DESC']]
					}).catch(() => null)
				)
			)
		).map((c, i) => [ids[i], c] as const);

		const cases = caseMap.filter(([, c]) => c != null && !c.pseudo).map(([id, c]) => [id, c!] as const);

		const promises = cases.map(([, c]) => ((c.evidence = evidence), c.save()));

		const res = await Promise.all(promises);

		const lines = ids.map((id, i) => {
			const $case = res[i];
			if ($case == null) return `${emojis.error} ${id} - no case found.`;
			return `${emojis.success} ${id} - ${$case.id}`;
		});

		this.client.emit(TanzaniteEvent.MassEvidence, message.member, message.guild, evidence, lines);

		const embeds = overflowEmbed(
			{
				color: colors.DarkRed,
				title: 'Mass Evidence'
			},
			lines
		);

		return message.util.send({ embeds });
	}
}
