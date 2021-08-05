import { APIInteractionGuildMember } from 'discord-api-types/v9';
import { ApplicationCommand, CommandInteraction, Invite, Snowflake } from 'discord.js';
import { RawCommandInteractionData } from 'discord.js/typings/rawDataTypes';
import { BushClient, BushTextBasedChannels } from '../discord-akairo/BushClient';
import { BushApplicationCommand } from './BushApplicationCommand';
import { BushGuild } from './BushGuild';
import { BushGuildChannel } from './BushGuildChannel';
import { BushGuildEmoji } from './BushGuildEmoji';
import { BushGuildMember } from './BushGuildMember';
import { BushRole } from './BushRole';
import { BushUser } from './BushUser';

export type BushGuildResolvable =
	| BushGuild
	| BushGuildChannel
	| BushGuildMember
	| BushGuildEmoji
	| Invite
	| BushRole
	| Snowflake;

export class BushCommandInteraction extends CommandInteraction {
	public constructor(client: BushClient, data: RawCommandInteractionData) {
		super(client, data);
	}
	public declare readonly client: BushClient;
	public declare readonly command: BushApplicationCommand | ApplicationCommand<{ guild: BushGuildResolvable }> | null;
	public declare readonly channel: BushTextBasedChannels | null;
	public declare readonly guild: BushGuild | null;
	public declare member: BushGuildMember | APIInteractionGuildMember | null;
	public declare user: BushUser;
}
