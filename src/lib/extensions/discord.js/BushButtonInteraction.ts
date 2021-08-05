import { APIInteractionGuildMember } from 'discord-api-types/v9';
import { ButtonInteraction } from 'discord.js';
import { RawMessageButtonInteractionData } from 'discord.js/typings/rawDataTypes';
import { BushClient, BushTextBasedChannels } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushUser } from './BushUser';

export class BushButtonInteraction extends ButtonInteraction {
	public declare readonly channel: BushTextBasedChannels | null;
	public declare readonly guild: BushGuild | null;
	public declare member: BushGuildMember | APIInteractionGuildMember | null;
	public declare user: BushUser;
	public constructor(client: BushClient, data: RawMessageButtonInteractionData) {
		super(client, data);
	}
}
