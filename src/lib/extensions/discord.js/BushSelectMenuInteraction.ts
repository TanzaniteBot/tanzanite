import { APIInteractionGuildMember } from 'discord-api-types/v8';
import { PartialDMChannel, SelectMenuInteraction } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushDMChannel } from './BushDMChannel';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushNewsChannel } from './BushNewsChannel';
import { BushTextChannel } from './BushTextChannel';
import { BushUser } from './BushUser';

export class BushSelectMenuInteraction extends SelectMenuInteraction {
	public declare readonly channel: BushTextChannel | BushDMChannel | BushNewsChannel | PartialDMChannel | null;
	public declare readonly guild: BushGuild | null;
	public declare member: BushGuildMember | APIInteractionGuildMember | null;
	public declare user: BushUser;
	public constructor(client: BushClient, data: unknown) {
		super(client, data);
	}
}
