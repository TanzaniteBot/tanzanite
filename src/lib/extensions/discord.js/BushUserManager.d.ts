import { Snowflake } from 'discord-api-types';
import { BaseFetchOptions, CachedManager } from 'discord.js';
import { BushClient, BushUserResolvable } from '../discord-akairo/BushClient';
import { BushUser } from './BushUser';

export class BushUserManager extends CachedManager<Snowflake, BushUser, BushUserResolvable> {
	public constructor(client: BushClient, iterable?: Iterable<unknown>);
	public fetch(id: Snowflake, options?: BaseFetchOptions): Promise<BushUser>;
}
