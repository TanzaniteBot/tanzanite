import { BushCommand, clientSendAndPermCheck, emojis, mappings, type CommandMessage, type SlashMessage } from '#lib';
import assert from 'assert/strict';

export default class Solved extends BushCommand {
	public constructor() {
		super('solved', {
			aliases: ['solved'],
			category: "Moulberry's Bush",
			description: 'A command to mark a support threads as solved.',
			usage: ['solved'],
			examples: ['solved'],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => clientSendAndPermCheck(m),
			userPermissions: [],
			slashGuilds: [mappings.guilds["Moulberry's Bush"]],
			restrictedGuilds: [mappings.guilds["Moulberry's Bush"]]
		});
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		assert(message.inGuild());
		assert(message.channel);

		if (!message.channel.isThread()) return message.util.reply(`${emojis.error} This command can only be used in threads.`);

		const allowed = [mappings.channels['neu-support'], '1006832334638678057'];

		if (!allowed.some((id) => message.channel!.parentId === id))
			return message.util.reply(
				`${emojis.error} This command can only be used in thread that are created in <#${mappings.channels['neu-support']}>.`
			);

		if (message.channel.name.startsWith('[Solved]')) return message.util.reply(`${emojis.error} This thread is already solved.`);

		if (!message.channel.name.startsWith('Support'))
			return message.util.reply(`${emojis.error} This thread is not a support thread.`);

		const newName = `[Solved] ${message.channel.name}`;

		await message.channel.setName(newName);
		await message.util.reply(`${emojis.success} This thread has been marked as solved.`);

		await message.channel.setArchived(true, `${message.author.tag} (${message.author.id}) marked this support thread as solved.`);
	}
}
