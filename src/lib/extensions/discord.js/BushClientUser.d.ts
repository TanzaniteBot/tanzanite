import {
	ActivityOptions,
	Base64Resolvable,
	BufferResolvable,
	ClientPresence,
	ClientUserEditData,
	PresenceData,
	PresenceStatusData
} from 'discord.js';
import { BushUser } from './BushUser';

export class BushClientUser extends BushUser {
	public mfaEnabled: boolean;
	public readonly presence: ClientPresence;
	public verified: boolean;
	public edit(data: ClientUserEditData): Promise<this>;
	public setActivity(options?: ActivityOptions): ClientPresence;
	public setActivity(name: string, options?: ActivityOptions): ClientPresence;
	public setAFK(afk: boolean, shardId?: number | number[]): ClientPresence;
	public setAvatar(avatar: BufferResolvable | Base64Resolvable): Promise<this>;
	public setPresence(data: PresenceData): ClientPresence;
	public setStatus(status: PresenceStatusData, shardId?: number | number[]): ClientPresence;
	public setUsername(username: string): Promise<this>;
}
