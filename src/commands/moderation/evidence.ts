import { BushCommand, ModLog, OptArgType, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import { ArgumentGeneratorReturn } from 'discord-akairo';
import { ArgumentTypeCasterReturn } from 'discord-akairo/dist/src/struct/commands/arguments/Argument.js';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';

export default class EvidenceCommand extends BushCommand {
	public constructor() {
		super('evidence', {
			aliases: ['evidence'],
			category: 'moderation',
			description: 'Add evidence to a modlog case.',
			usage: ['evidence <caseId> <evidence>'],
			examples: ['evidence IgQvFpzgIKJ77mZ62TEuG was spamming in #general'],
			args: [
				{
					id: 'case_id',
					description: 'The case to modify the evidence of.',
					type: 'string',
					prompt: 'What case would you like to modify the evidence of?',
					slashType: ApplicationCommandOptionType.String,
					only: 'slash'
				},
				{
					id: 'evidence',
					description: 'The value to set the evidence to.',
					type: 'string',
					prompt: 'What would you like to modify the evidence to?',
					slashType: ApplicationCommandOptionType.String,
					only: 'slash'
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: (m) => util.userGuildPermCheck(m, [PermissionFlagsBits.ManageMessages])
		});
	}

	public override *args(message: BushMessage): ArgumentGeneratorReturn {
		const case_id: ArgumentTypeCasterReturn<'string'> = yield {
			id: 'case_id',
			type: 'string',
			prompt: {
				start: 'What case would you like to modify the evidence of?',
				retry: '{error} Pick a valid case to modify the evidence of.',
				optional: false
			}
		};

		const evidence: ArgumentTypeCasterReturn<'string'> = yield {
			id: 'evidence',
			type: 'string',
			match: 'restContent',
			prompt: {
				start: 'What would you like to modify the evidence to?',
				retry: '{error} Pick a valid argument.',
				optional: !!message.attachments.some((attachment) => !!attachment.contentType?.includes('image'))
			}
		};

		return { case_id, evidence };
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		{ case_id: caseID, evidence }: { case_id: string; evidence: OptArgType<'string'> }
	) {
		assert(message.inGuild());

		const entry = await ModLog.findByPk(caseID);
		if (!entry || entry.pseudo) return message.util.send(`${util.emojis.error} Invalid modlog entry.`);
		if (entry.guild !== message.guild.id) return message.util.reply(`${util.emojis.error} This modlog is from another server.`);

		const oldEntry = entry.evidence;

		const _evidence = EvidenceCommand.getEvidence(message, evidence);
		if (!_evidence) return;

		entry.evidence = _evidence.trim();
		await entry.save();

		client.emit('bushUpdateModlog', message.member!, entry.id, 'evidence', oldEntry, entry.evidence);

		return message.util.reply(`${util.emojis.success} Successfully updated the evidence for case ${util.format.input(caseID)}.`);
	}

	public static getEvidence(message: BushMessage | BushSlashMessage, evidenceArg: OptArgType<'string'>): null | string {
		if (evidenceArg && (message as BushMessage).attachments?.size) {
			void message.util.reply(`${util.emojis.error} Please either attach an image or a reason not both.`);
			return null;
		}

		const _evidence = evidenceArg
			? evidenceArg
			: !message.util.isSlash
			? (message as BushMessage).attachments.first()?.url
			: undefined;
		if (!_evidence) {
			void message.util.reply(`${util.emojis.error} You must provide evidence for this modlog.`);
			return null;
		}

		return _evidence;
	}
}
