import {
	BushCommand,
	clientSendAndPermCheck,
	emojis,
	format,
	ModLog,
	OptArgType,
	regex,
	userGuildPermCheck,
	type ArgType,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import assert from 'assert/strict';
import { Argument, ArgumentGeneratorReturn } from 'discord-akairo';
import { ApplicationCommandOptionType, PermissionFlagsBits, type Message } from 'discord.js';

export default class EvidenceCommand extends BushCommand {
	public constructor() {
		super('evidence', {
			aliases: ['evidence'],
			category: 'moderation',
			description: 'Add evidence to a modlog case.',
			usage: ['evidence <target> <evidence>'],
			examples: ['evidence IgQvFpzgIKJ77mZ62TEuG was spamming in #general', 'evidence @IRONMOON too much mod abuse'],
			args: [
				{
					id: 'case_id',
					description: 'The case to modify the evidence of.',
					type: 'string',
					prompt: 'What case would you like to modify the evidence of?',
					slashType: ApplicationCommandOptionType.String,
					only: 'slash',
					optional: true
				},
				{
					id: 'user',
					description: 'The user to modify the evidence of the latest modlog of.',
					type: 'user',
					prompt: "What user's latest modlog would you like to modify the evidence of?",
					slashType: ApplicationCommandOptionType.User,
					only: 'slash',
					optional: true
				},
				{
					id: 'evidence',
					description: 'The value to set the evidence to.',
					type: 'string',
					prompt: 'What would you like to modify the evidence to?',
					slashType: ApplicationCommandOptionType.String,
					only: 'slash',
					optional: true
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => clientSendAndPermCheck(m),
			userPermissions: (m) => userGuildPermCheck(m, [PermissionFlagsBits.ManageMessages])
		});
	}

	public override *args(message: CommandMessage): ArgumentGeneratorReturn {
		const target: ArgType<'string' | 'snowflake'> = yield {
			id: 'target',
			type: Argument.union('snowflake', 'string'),
			prompt: {
				start: 'What case or user would you like to modify the evidence of?',
				retry: '{error} Pick a valid case id or user to modify the evidence of.',
				optional: false
			}
		};

		const evidence: OptArgType<'string'> = yield {
			id: 'evidence',
			type: 'string',
			match: 'restContent',
			prompt: {
				start: 'What would you like to modify the evidence to?',
				retry: '{error} Pick a valid argument.',
				optional: !!message.attachments.some((attachment) => !!attachment.contentType?.includes('image'))
			}
		};

		return { target, evidence };
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		{
			case_id: caseID,
			user,
			target: messageCommandTarget,
			evidence
		}: {
			case_id: OptArgType<'string'>;
			user: OptArgType<'user'>;
			target: ArgType<'string' | 'snowflake'>;
			evidence: OptArgType<'string'>;
		}
	) {
		assert(message.inGuild());

		if (message.interaction && !caseID && !user)
			return message.util.send(`${emojis.error} You must provide either a user or a case ID.`);

		const entry = messageCommandTarget
			? regex.snowflake.test(messageCommandTarget)
				? await ModLog.findOne({ where: { user: messageCommandTarget }, order: [['createdAt', 'DESC']] })
				: await ModLog.findByPk(messageCommandTarget)
			: caseID
			? await ModLog.findByPk(caseID)
			: await ModLog.findOne({ where: { user: user!.id }, order: [['createdAt', 'DESC']] });

		if (!entry || entry.pseudo) return message.util.send(`${emojis.error} Invalid modlog entry.`);
		if (entry.guild !== message.guild.id) return message.util.reply(`${emojis.error} This modlog is from another server.`);

		const oldEntry = entry.evidence;

		const _evidence = EvidenceCommand.getEvidence(message, evidence);
		if (!_evidence) return;

		entry.evidence = _evidence.trim();
		await entry.save();

		this.client.emit('bushUpdateModlog', message.member!, entry.id, 'evidence', oldEntry, entry.evidence);

		return message.util.reply(`${emojis.success} Successfully updated the evidence for case ${format.input(entry.id)}.`);
	}

	public static getEvidence(message: CommandMessage | SlashMessage, evidenceArg: OptArgType<'string'>): null | string {
		if (evidenceArg && (message as Message).attachments?.size) {
			void message.util.reply(`${emojis.error} Please either attach an image or a reason not both.`);
			return null;
		}

		const _evidence = evidenceArg
			? evidenceArg
			: !message.util.isSlash
			? (message as Message).attachments.first()?.url
			: undefined;
		if (!_evidence) {
			void message.util.reply(`${emojis.error} You must provide evidence for this modlog.`);
			return null;
		}

		return _evidence;
	}
}
