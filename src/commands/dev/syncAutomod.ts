import { BotCommand, emojis, Shared, type CommandMessage, type SlashMessage } from '#lib';
import typescript from 'typescript';
import { NodeVM } from 'vm2';

export default class SyncAutomodCommand extends BotCommand {
	public constructor() {
		super('syncAutomod', {
			aliases: ['sync-automod'],
			category: 'dev',
			description: 'Syncs automod info with the github repository.',
			usage: ['sync-automod'],
			examples: ['sync-automod'],
			slash: false,
			hidden: true,
			clientPermissions: [],
			userPermissions: []
		});
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		if (!message.author.isOwner() && message.author.id !== '497789163555389441')
			return await message.util.reply(`${emojis.error} Only a very select few may use this command.`);

		const badLinks = await fetch('https://raw.githubusercontent.com/TanzaniteBot/tanzanite/master/lib/badlinks.ts').then((p) =>
			p.ok ? p.text() : null
		);
		const badWords = await fetch('https://raw.githubusercontent.com/TanzaniteBot/tanzanite/master/lib/badwords.ts').then((p) =>
			p.ok ? p.text() : null
		);

		if (badLinks == null || badWords == null) {
			return await message.util.reply(`${emojis.error} Failed to fetch bad links or bad words.`);
		}

		const transpiledBadLinks = typescript.transpileModule(badLinks, {}).outputText;
		const transpiledBadWords = typescript.transpileModule(badWords, {}).outputText;

		/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
		const badLinksParsed = new NodeVM({}).run(transpiledBadLinks).default;
		const badWordsParsed = new NodeVM({}).run(transpiledBadWords).default;

		const row = (await Shared.findByPk(0))!;
		row.badLinks = badLinksParsed;
		row.badWords = badWordsParsed;
		await row.save();
		/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

		return await message.util.reply(`${emojis.success} Automod info synced.`);
	}
}
