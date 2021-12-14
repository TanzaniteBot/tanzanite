import { BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import { MessageActionRow, MessageButton } from 'discord.js';
import packageDotJSON from '../../../package.json' assert { type: 'json' };

export default class LinksCommand extends BushCommand {
	public constructor() {
		super('links', {
			aliases: ['links', 'invite', 'support'],
			category: 'info',
			description: 'Sends bot links',
			usage: ['links'],
			examples: ['links'],
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: [],
			slash: true
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage) {
		if (client.config.isDevelopment) return await message.util.reply(`${util.emojis.error} The dev bot cannot be invited.`);
		const ButtonRow = new MessageActionRow().addComponents(
			new MessageButton({
				style: 'LINK',
				label: 'Invite Me',
				url: `https://discord.com/api/oauth2/authorize?client_id=${
					client.user!.id
				}&permissions=5368709119918&scope=bot%20applications.commands`
			}),
			new MessageButton({
				style: 'LINK',
				label: 'Support Server',
				url: client.config.supportGuild.invite
			}),
			new MessageButton({
				style: 'LINK',
				label: 'GitHub',
				url: packageDotJSON.repository
			})
		);
		return await message.util.reply({ content: '\u200B', components: [ButtonRow] });
	}
}
