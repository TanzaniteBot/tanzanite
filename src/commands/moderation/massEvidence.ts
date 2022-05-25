import { BushCommand, ModLog, type ArgType, type BushMessage, type BushSlashMessage, type OptionalArgType } from '#lib';
import assert from 'assert';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import { EvidenceCommand } from '../index.js';

export default class MassEvidenceCommand extends BushCommand {
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
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: [PermissionFlagsBits.ManageMessages],
			lock: 'user'
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { users: ArgType<'string'>; evidence: OptionalArgType<'string'> }
	) {
		assert(message.inGuild());

		const evidence = EvidenceCommand.getEvidence(message, args.evidence);
		if (!evidence) return;

		const ids = args.users.split(/\n| /).filter((id) => id.length > 0);
		if (ids.length === 0) return message.util.send(`${util.emojis.error} You must provide at least one user id.`);
		for (const id of ids) {
			if (!client.constants.regex.snowflake.test(id))
				return message.util.send(`${util.emojis.error} ${id} is not a valid snowflake.`);
		}

		const caseMap = (
			await Promise.all(
				ids.map((id) =>
					ModLog.findOne({
						where: { guild: message.guild.id, user: id },
						order: [['createdAt', 'ASC']]
					}).catch(() => null)
				)
			)
		).map((c, i) => [ids[i], c] as const);

		const cases = caseMap.filter(([, c]) => c && !c.pseudo).map(([id, c]) => [id, c!] as const);

		const promises = cases.map(([, c]) => ((c.evidence = evidence), c.save()));

		const res = await Promise.all(promises);

		const lines = ids.map((_, i) => {
			const case_ = res[i];
			if (!case_) return `${util.emojis.error} ${i} - no case found.`;
			return `${util.emojis.success} ${i} - ${case_.id}`;
		});

		client.emit('massEvidence', message.member!, message.guild, evidence, lines);

		const embeds = util.overflowEmbed(
			{
				color: util.colors.DarkRed,
				title: 'Mass Evidence'
			},
			lines
		);

		return message.util.send({ embeds });
	}
}
