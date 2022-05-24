import { BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
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
		const buttonRow = new ActionRowBuilder<ButtonBuilder>();
		if (!client.config.isDevelopment || message.author.isOwner()) {
			buttonRow.addComponents([new ButtonBuilder({ style: ButtonStyle.Link, label: 'Invite Me', url: util.invite })]);
		}
		buttonRow.addComponents([
			new ButtonBuilder({ style: ButtonStyle.Link, label: 'Support Server', url: client.config.supportGuild.invite }),
			new ButtonBuilder({ style: ButtonStyle.Link, label: 'GitHub', url: packageDotJSON.repository })
		]);
		return await message.util.reply({ content: 'Here are some useful links:', components: [buttonRow] });
	}
}
