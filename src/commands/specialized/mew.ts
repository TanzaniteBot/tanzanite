import { BotCommand, Time, type CommandMessage, type SlashMessage } from '#lib';
import assert from 'assert';

export default class MewCommand extends BotCommand {
	public constructor() {
		super('mew', {
			aliases: ['mew'],
			category: 'specialized',
			description: 'mew.',
			usage: ['mew'],
			examples: ['mew'],
			slash: true,
			channel: 'guild',
			clientPermissions: ['ModerateMembers'],
			userPermissions: [],
			restrictedGuilds: ['1148411253388226590']
		});
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		assert(message.inGuild());

		if (!message.member.moderatable) {
			return message.util.reply('https://tenor.com/view/mewing-gif-11339234860235694668');
		}

		await message.member.timeout(5 * Time.Minute, 'mew');

		return message.util.reply('bye bye');
	}
}
