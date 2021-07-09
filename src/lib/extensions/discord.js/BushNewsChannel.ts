import { AllowedThreadTypeForNewsChannel, NewsChannel } from 'discord.js';
import { BushClient, BushGuild, BushMessageManager, BushThreadManager } from '..';

export class BushNewsChannel extends NewsChannel {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public declare messages: BushMessageManager;
	public declare threads: BushThreadManager<AllowedThreadTypeForNewsChannel>;
	// eslint-disable-next-line @typescript-eslint/ban-types
	public constructor(guild: BushGuild, data?: object) {
		super(guild, data);
	}
}
