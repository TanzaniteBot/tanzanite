import { BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import { assert } from 'console';
import { ActionRow, ButtonComponent, ButtonStyle } from 'discord.js';
import packageDotJSON from '../../../package.json' assert { type: 'json' };

assert(packageDotJSON);

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
		const buttonRow = new ActionRow();
		if (!client.config.isDevelopment || message.author.isOwner()) {
			buttonRow.addComponents(new ButtonComponent().setStyle(ButtonStyle.Link).setLabel('Invite Me').setURL(util.invite));
		}
		buttonRow.addComponents(
			new ButtonComponent().setStyle(ButtonStyle.Link).setLabel('Support Server').setURL(client.config.supportGuild.invite),
			new ButtonComponent().setStyle(ButtonStyle.Link).setLabel('GitHub').setURL(packageDotJSON.repository)
		);
		return await message.util.reply({ content: 'Here are some useful links:', components: [buttonRow] });
	}
}
