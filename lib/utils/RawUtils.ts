import { DiscordSnowflake } from '@sapphire/snowflake';
import type { APIUser, ImageURLOptions, REST, Snowflake } from 'discord.js';

// these functions mimic what discord.js does,
// allowing easier use of raw data

export function rawTag(user: APIUser): string {
	return `${user.username}#${user.discriminator}`;
}

export function rawCreatedTimestamp<T extends { id: Snowflake }>(obj: T): number {
	return DiscordSnowflake.timestampFrom(obj.id);
}

export function rawAvatarURL(rest: REST, user: APIUser, options: ImageURLOptions = {}): string | null {
	return user.avatar && rest.cdn.avatar(user.id, user.avatar, options);
}

export function rawDefaultAvatarURL(rest: REST, user: APIUser): string {
	return rest.cdn.defaultAvatar(Number(user.discriminator) % 5);
}

export function rawDisplayAvatarURL(rest: REST, user: APIUser, options: ImageURLOptions = {}) {
	return rawAvatarURL(rest, user, options) ?? rawDefaultAvatarURL(rest, user);
}
