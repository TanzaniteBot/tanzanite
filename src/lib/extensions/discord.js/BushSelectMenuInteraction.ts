import { APIInteractionGuildMember } from 'discord-api-types/v9';
import { SelectMenuInteraction } from 'discord.js';
import { RawMessageSelectMenuInteractionData } from 'discord.js/typings/rawDataTypes';
import { BushClient, BushTextBasedChannels } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushUser } from './BushUser';

export class BushSelectMenuInteraction extends SelectMenuInteraction {
	public declare readonly channel: BushTextBasedChannels | null;
	public declare readonly guild: BushGuild | null;
	public declare member: BushGuildMember | APIInteractionGuildMember | null;
	public declare user: BushUser;
	public constructor(client: BushClient, data: RawMessageSelectMenuInteractionData) {
		super(client, data);
	}
}
