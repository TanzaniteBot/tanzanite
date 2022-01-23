import {
	BushGuildTextBasedChannel,
	type BushClient,
	type BushCommandUtil,
	type BushGuild,
	type BushGuildMember,
	type BushTextBasedChannel,
	type BushUser
} from '#lib';
import { AkairoMessage } from 'discord-akairo';
import { type ChatInputCommandInteraction, type ContextMenuCommandInteraction } from 'discord.js';

export class BushSlashMessage extends AkairoMessage {
	public declare client: BushClient;
	public declare util: BushCommandUtil<BushSlashMessage>;
	public declare author: BushUser;
	public declare member: BushGuildMember | null;
	public constructor(client: BushClient, interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction) {
		super(client, interaction);
	}
}

export interface BushSlashMessage extends AkairoMessage {
	get channel(): BushTextBasedChannel | null;
	get guild(): BushGuild | null;
	inGuild(): this is BushSlashMessageInGuild & this;
}

interface BushSlashMessageInGuild {
	guild: BushGuild;
	channel: BushGuildTextBasedChannel;
}
