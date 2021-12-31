import {
	type BushClient,
	type BushCommandUtil,
	type BushGuild,
	type BushGuildMember,
	type BushTextBasedChannel,
	type BushUser
} from '#lib';
import { AkairoMessage } from 'discord-akairo';
import { type CommandInteraction } from 'discord.js';

export class BushSlashMessage extends AkairoMessage {
	public declare client: BushClient;
	public declare util: BushCommandUtil<BushSlashMessage>;
	public declare author: BushUser;
	public declare member: BushGuildMember | null;
	public constructor(client: BushClient, interaction: CommandInteraction) {
		super(client, interaction);
	}
}

export interface BushSlashMessage extends AkairoMessage {
	get channel(): BushTextBasedChannel | null;
	get guild(): BushGuild | null;
	inGuild(): this is this & { guild: BushGuild; member: BushGuildMember };
}
