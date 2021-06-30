import { Message } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushCommandUtil } from '../discord-akairo/BushCommandUtil';
import { BushDMChannel } from './BushDMChannel';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushNewsChannel } from './BushNewsChannel';
import { BushTextChannel } from './BushTextChannel';
import { BushThreadChannel } from './BushThreadChannel';
import { BushUser } from './BushUser';

export class BushMessage extends Message {
	public declare readonly client: BushClient;
	public declare util: BushCommandUtil;
	public declare readonly guild: BushGuild;
	public declare readonly member: BushGuildMember;
	public declare author: BushUser;
	public declare channel: BushTextChannel | BushDMChannel | BushNewsChannel | BushThreadChannel;
	public constructor(
		client: BushClient,
		data: unknown,
		channel: BushTextChannel | BushDMChannel | BushNewsChannel | BushThreadChannel
	) {
		super(client, data, channel);
	}
}
