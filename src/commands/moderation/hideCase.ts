import { BotCommand, ModLog, TanzaniteEvent, emojis, format, type CommandMessage, type SlashMessage } from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';
import assert from 'node:assert/strict';

export default class HideCaseCommand extends BotCommand {
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
			clientPermissions: [],
			userPermissions: ['ManageMessages'],
			channel: 'guild'
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, { case_id: caseID }: { case_id: string }) {
		assert(message.inGuild());

		const entry = await ModLog.findByPk(caseID);
		if (!entry || entry.pseudo) return message.util.send(`${emojis.error} Invalid entry.`);
		if (entry.guild !== message.guild.id) return message.util.reply(`${emojis.error} This modlog is from another server.`);
		const action = entry.hidden ? 'no longer hidden' : 'now hidden';
		const oldEntry = entry.hidden;
		entry.hidden = !entry.hidden;
		await entry.save();

		this.client.emit(TanzaniteEvent.UpdateModlog, message.member, entry.id, 'hidden', oldEntry, entry.hidden);

		return await message.util.reply(`${emojis.success} CaseID ${format.input(caseID)} is ${action}.`);
	}
}
