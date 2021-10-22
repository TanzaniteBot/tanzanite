import { BushCommand, BushMessage, BushSlashMessage, ModLog } from '@lib';

export default class HideCaseCommand extends BushCommand {
	public constructor() {
		super('hideCase', {
			aliases: ['hide-case', 'hide_case', 'showcase', 'show_case', 'cover-up-mod-abuse', 'cover_up_mod_abuse'],
			category: 'moderation',
			description: {
				content: 'Hide a particular modlog case from the modlog command unless the `--hidden` flag is specified',
				usage: 'hideCase <case_id>',
				examples: ['hideCase 9210b1ea-91f5-4ea2-801b-02b394469c77']
			},
			args: [
				{
					id: 'case_id',
					type: 'string',
					prompt: {
						start: 'What modlog case would you like to hide?',
						retry: '{error} Choose a valid case id.'
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'case_id',
					description: 'What modlog case would you like to hide?',
					type: 'STRING',
					required: true
				}
			],
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: (m) => util.userGuildPermCheck(m, ['MANAGE_MESSAGES']),
			channel: 'guild'
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		{ case_id: caseID }: { case_id: string }
	): Promise<unknown> {
		const entry = await ModLog.findByPk(caseID);
		if (!entry || entry.pseudo) return message.util.send(`${util.emojis.error} Invalid entry.`);
		if (entry.guild !== message.guild!.id)
			return message.util.reply(`${util.emojis.error} This modlog is from another server.`);
		const action = entry.hidden ? 'no longer hidden' : 'now hidden';
		const oldEntry = entry.hidden;
		entry.hidden = !entry.hidden;
		await entry.save();

		client.emit('bushUpdateModlog', message.member!, entry.id, 'hidden', oldEntry, entry.hidden);

		return await message.util.reply(`${util.emojis.success} CaseID \`${caseID}\` is ${action}.`);
	}
}
