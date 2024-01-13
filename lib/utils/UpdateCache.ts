import config from '#config';
import { Global, Guild, Shared } from '#models';
import type { Client } from 'discord.js';

export async function updateGlobalCache(client: Client) {
	const environment = config.environment;
	const row: Record<string, any> = ((await Global.findByPk(environment)) ?? (await Global.create({ environment }))).toJSON();

	for (const option in row) {
		if (Object.keys(client.cache.global).includes(option)) {
			client.cache.global[option as keyof typeof client.cache.global] = row[option];
		}
	}
}

export async function updateSharedCache(client: Client) {
	const row: Record<string, any> = ((await Shared.findByPk(0)) ?? (await Shared.create({ primaryKey: 0 }))).toJSON();

	for (const option in row) {
		if (Object.keys(client.cache.shared).includes(option)) {
			client.cache.shared[option as keyof typeof client.cache.shared] = row[option];
			if (option === 'superUsers') client.superUserID = row[option];
		}
	}
}

export async function updateGuildCache(client: Client) {
	const rows = await Guild.findAll();
	for (const row of rows) {
		client.cache.guilds.set(row.id, row.toJSON() as Guild);
	}
}

export async function updateEveryCache(client: Client) {
	await Promise.all([updateGlobalCache(client), updateSharedCache(client), updateGuildCache(client)]);
}
