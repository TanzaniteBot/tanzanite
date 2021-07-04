import { APIInteractionGuildMember } from 'discord-api-types/v8';
import {
	ApplicationCommand,
	CommandInteraction,
	DMChannel,
	Invite,
	NewsChannel,
	PartialDMChannel,
	Snowflake,
	TextChannel
} from 'discord.js';
import {
	BushApplicationCommand,
	BushClient,
	BushGuild,
	BushGuildChannel,
	BushGuildEmoji,
	BushGuildMember,
	BushRole,
	BushUser
} from '..';

export type BushGuildResolvable =
	| BushGuild
	| BushGuildChannel
	| BushGuildMember
	| BushGuildEmoji
	| Invite
	| BushRole
	| Snowflake;

export class BushCommandInteraction extends CommandInteraction {
	public declare readonly client: BushClient;
	public declare readonly command: BushApplicationCommand | ApplicationCommand<{ guild: BushGuildResolvable }> | null;
	public declare readonly channel: TextChannel | DMChannel | NewsChannel | PartialDMChannel | null;
	public declare readonly guild: BushGuild | null;
	public declare member: BushGuildMember | APIInteractionGuildMember | null;
	public declare user: BushUser;
}
