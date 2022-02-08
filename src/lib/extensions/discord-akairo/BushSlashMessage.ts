import {
	BushCommandHandler,
	BushGuildTextBasedChannel,
	type BushClient,
	type BushCommandUtil,
	type BushGuild,
	type BushGuildMember,
	type BushTextBasedChannel,
	type BushUser
} from '#lib';
import { AkairoMessage } from 'discord-akairo';
import { type ChatInputCommandInteraction } from 'discord.js';

export class BushSlashMessage extends AkairoMessage {
	public declare client: BushClient;
	public declare util: BushCommandUtil<BushSlashMessage> & { handler: BushCommandHandler };
	public declare author: BushUser;
	public declare member: BushGuildMember | null;
	public declare interaction: ChatInputCommandInteraction;
	public constructor(client: BushClient, interaction: ChatInputCommandInteraction) {
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
