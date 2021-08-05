import {
	ActivityOptions,
	Base64Resolvable,
	BufferResolvable,
	ClientUserEditData,
	Presence as BushPresence,
	PresenceData,
	PresenceStatusData
} from 'discord.js';
import { BushUser } from './BushUser';

export class BushClientUser extends BushUser {
	public mfaEnabled: boolean;
	public verified: boolean;
	public edit(data: ClientUserEditData): Promise<this>;
	public setActivity(options?: ActivityOptions): BushPresence;
	public setActivity(name: string, options?: ActivityOptions): BushPresence;
	public setAFK(afk: boolean, shardId?: number | number[]): BushPresence;
	public setAvatar(avatar: BufferResolvable | Base64Resolvable): Promise<this>;
	public setPresence(data: PresenceData): BushPresence;
	public setStatus(status: PresenceStatusData, shardId?: number | number[]): BushPresence;
	public setUsername(username: string): Promise<this>;
}
