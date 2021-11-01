import type { BushClient, BushUser, BushUserResolvable } from '#lib';
import { CachedManager, type BaseFetchOptions, type Snowflake } from 'discord.js';
import type { RawUserData } from 'discord.js/typings/rawDataTypes';

export class BushUserManager extends CachedManager<Snowflake, BushUser, BushUserResolvable> {
	public constructor(client: BushClient, iterable?: Iterable<RawUserData>);
	public fetch(id: Snowflake, options?: BaseFetchOptions): Promise<BushUser>;
}
