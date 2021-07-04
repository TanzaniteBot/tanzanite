import { APIInteractionGuildMember } from 'discord-api-types/v8';
import { PartialDMChannel, SelectMenuInteraction } from 'discord.js';
import { BushClient, BushDMChannel, BushGuild, BushGuildMember, BushNewsChannel, BushTextChannel, BushUser } from '..';

export class BushSelectMenuInteraction extends SelectMenuInteraction {
	public declare readonly channel: BushTextChannel | BushDMChannel | BushNewsChannel | PartialDMChannel | null;
	public declare readonly guild: BushGuild | null;
	public declare member: BushGuildMember | APIInteractionGuildMember | null;
	public declare user: BushUser;
	public constructor(client: BushClient, data: unknown) {
		super(client, data);
	}
}
