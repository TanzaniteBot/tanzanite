import {
	ActivityOptions,
	Base64Resolvable,
	BufferResolvable,
	ClientUserEditData,
	Presence,
	PresenceData,
	PresenceStatusData
} from 'discord.js';
import { BushUser } from './BushUser';

export class BushClientUser extends BushUser {
	public mfaEnabled: boolean;
	public verified: boolean;
	public edit(data: ClientUserEditData): Promise<this>;
	public setActivity(options?: ActivityOptions): Presence;
	public setActivity(name: string, options?: ActivityOptions): Presence;
	public setAFK(afk: boolean, shardId?: number | number[]): Presence;
	public setAvatar(avatar: BufferResolvable | Base64Resolvable): Promise<this>;
	public setPresence(data: PresenceData): Presence;
	public setStatus(status: PresenceStatusData, shardId?: number | number[]): Presence;
	public setUsername(username: string): Promise<this>;
}
