import { BushCommand, clientSendAndPermCheck, invite, type CommandMessage, type SlashMessage } from '#lib';
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
			clientPermissions: (m) => clientSendAndPermCheck(m),
			userPermissions: [],
			slash: true
		});
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		const buttonRow = new ActionRowBuilder<ButtonBuilder>();
		if (!this.client.config.isDevelopment || message.author.isOwner()) {
			buttonRow.addComponents([new ButtonBuilder({ style: ButtonStyle.Link, label: 'Invite Me', url: invite(this.client) })]);
		}
		buttonRow.addComponents([
			new ButtonBuilder({ style: ButtonStyle.Link, label: 'Support Server', url: this.client.config.supportGuild.invite }),
			new ButtonBuilder({ style: ButtonStyle.Link, label: 'GitHub', url: packageDotJSON.repository })
		]);
		return await message.util.reply({ content: 'Here are some useful links:', components: [buttonRow] });
	}
}
