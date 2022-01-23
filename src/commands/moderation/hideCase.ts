import { BushCommand, ModLog, type BushMessage, type BushSlashMessage } from '#lib';
import { ApplicationCommandOptionType, Permissions } from 'discord.js';

export default class HideCaseCommand extends BushCommand {
	public constructor() {
		super('hideCase', {
			aliases: ['hide-case', 'hide_case', 'show-case', 'show_case', 'cover-up-mod-abuse', 'cover_up_mod_abuse'],
			category: 'moderation',
			description: 'Hide a particular modlog case from the modlog command unless the `--hidden` flag is specified',
			usage: ['hide-case <caseId>'],
			examples: ['hide-case Xurm---HdRyHlrKLsOcIO'],
			args: [
				{
					id: 'case_id',
					description: 'The id of the case to be hidden.',
					type: 'string',
					prompt: 'What modlog case would you like to hide?',
					retry: '{error} Choose a valid case id.',
					slashType: ApplicationCommandOptionType.String
				}
			],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: (m) => util.userGuildPermCheck(m, [Permissions.FLAGS.MANAGE_MESSAGES]),
			channel: 'guild'
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, { case_id: caseID }: { case_id: string }) {
		const entry = await ModLog.findByPk(caseID);
		if (!entry || entry.pseudo) return message.util.send(`${util.emojis.error} Invalid entry.`);
		if (entry.guild !== message.guild!.id) return message.util.reply(`${util.emojis.error} This modlog is from another server.`);
		const action = entry.hidden ? 'no longer hidden' : 'now hidden';
		const oldEntry = entry.hidden;
		entry.hidden = !entry.hidden;
		await entry.save();

		client.emit('bushUpdateModlog', message.member!, entry.id, 'hidden', oldEntry, entry.hidden);

		return await message.util.reply(`${util.emojis.success} CaseID \`${caseID}\` is ${action}.`);
	}
}
