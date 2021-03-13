/* eslint-disable @typescript-eslint/no-explicit-any */
import { globalOptionsSchema, guildOptionsSchema, userOptionsSchema } from '../extensions/mongoose';
import moment from 'moment';
import * as botoptions from '../config/botoptions';
import chalk from 'chalk';
import functions from './functions';

type globalOptions = 'disabledCommands' | 'mainGuild' | 'superUsers' | 'channelBlacklist' | 'userBlacklist' | 'roleBlacklist' | 'roleWhitelist' | 'dmChannel' | 'errorChannel' | 'generalLogChannel';
type guildOptions = 'prefix' | 'welcomeChannel' | 'autoPublishChannels';
type userOptions = 'autoRespond';

let globalCache: Array<Record<string, unknown>>, guildCache: Array<Record<string, unknown>>, userCache: Array<Record<string, unknown>>, lastGlobal: number, lastGuild: number, lastUser: number;

function search(key: string, value: string, Array: Array<unknown>) {
	for (let i = 0; i < Array.length; i++) {
		if (Array[i] && Array[i][key]) {
			if (Array[i][key] == value) {
				return Array[i];
			}
		}
	}
}

function findIndex(key: string, value, Array: Array<Record<string, unknown>>): number {
	for (let i = 0; i < Array.length; i++) {
		if (Array[i] && Array[i][key]) {
			if (Array[i][key] == value) {
				return i;
			}
		}
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function find(type: 'global' | 'guild' | 'user'): Promise<any> {
	let schema;
	switch (type) {
		case 'global':
			schema = globalOptionsSchema;
			break;
		case 'guild':
			schema = guildOptionsSchema;
			break;
		case 'user':
			schema = userOptionsSchema;
			break;
		default:
			throw 'wat';
	}
	const now = Date.now();
	//check if last db fetch was more than 10 minutes ago or never happened
	if (!eval(`last${type.charAt(0).toUpperCase() + type.slice(1)}`) || moment(eval(`last${type.charAt(0).toUpperCase() + type.slice(1)}`)).isBefore(moment(now).subtract(10, 'minutes'))) {
		// if (!lastGlobal || moment(lastGlobal).isBefore(moment(now).subtract(10, 'minutes')))
		const data = await schema.find();
		eval(`${type}Cache = data;`); //globalCache = data
		eval(`last${type.charAt(0).toUpperCase() + type.slice(1)} = Date.now();`); //lastGlobal = Date.now()
		if (botoptions.verbose) {
			console.info(`${chalk.bgCyan(functions.timeStamp())} ${chalk.cyan('[db]')} Fetched ${chalk.blueBright(type)} data.`);
		}
		return data;
	} else {
		return eval(`${type}Cache`); //return globalCache
	}
}

async function globalGet(setting: globalOptions, defaultValue: string | string[]): Promise<string | string[]> {
	const data = await find('global'),
		data2 = search('environment', botoptions.environment, data);
	if (!data2 || !data2['settings'] || !data2['settings'][setting]) {
		if (botoptions.verbose) {
			console.info(`${chalk.bgCyan(functions.timeStamp())} ${chalk.cyan('[Global]')} Used default value for ${chalk.blueBright(setting)}.`);
		}
		return defaultValue;
	}
	return data2['settings'][setting];
}

async function guildGet(setting: guildOptions, id: string, defaultValue: string | string[]): Promise<string | string[]> {
	const data = await find('guild'),
		data2 = search('id', id, data);
	if (!data2 || !data2['settings'][setting]) {
		if (botoptions.verbose) {
			console.info(`${chalk.bgCyan(functions.timeStamp())} ${chalk.cyan('[Guild]')} Used default value of ${chalk.blueBright(setting)} for ${chalk.blueBright(id)}.`);
		}
		return defaultValue;
	}
	return data2['settings'][setting];
}

async function userGet(setting: userOptions, id: string, defaultValue: string | string[]): Promise<string | string[]> {
	const data = await find('guild'),
		data2 = search('id', id, data);
	if (!data2 || !data2['settings'][setting]) {
		if (botoptions.verbose) {
			console.info(`${chalk.bgCyan(functions.timeStamp())} ${chalk.cyan('[User]')} Used default value of ${chalk.blueBright(setting)} for ${chalk.blueBright(id)}.`);
		}
		return defaultValue;
	}
	return data2['settings'][setting];
}

async function globalUpdate(setting: globalOptions, newValue: string | string[]): Promise<void> {
	const data = await find('global'),
		data2 = search('environment', botoptions.environment, data);

	if (!data2 || !data2['_id']) {
		const attributes = {};
		attributes[setting] = newValue;
		const Query2 = new globalOptionsSchema({
			enviroment: botoptions.environment,
			attributes
		});
		await Query2.save();
		return;
	}
	const settings = data2['settings'];
	settings[setting] = newValue;
	const Query = await globalOptionsSchema.findByIdAndUpdate(data2['_id'], { settings });
	await Query.save();
	const index: number = findIndex('environment', botoptions.environment, data);
	globalCache = data;
	globalCache[index]['settings'] = settings;
	return;
}

async function guildUpdate(setting: guildOptions, newValue: string | string[], id: string): Promise<void> {
	const data = await find('guild'),
		data2 = search('id', id, data);

	if (!data2 || !data2['_id']) {
		const attributes = {};
		attributes[setting] = newValue;
		const Query2 = new guildOptionsSchema({
			id,
			attributes
		});
		await Query2.save();
		return;
	}
	const settings = data2['settings'];
	settings[setting] = newValue;
	const Query = await guildOptionsSchema.findByIdAndUpdate(data2['_id'], { settings });
	await Query.save();
	const index: number = findIndex('id', id, data);
	guildCache = data;
	guildCache[index]['settings'] = settings;
	return;
}

async function userUpdate(setting: userOptions, newValue: string | string[], id: string): Promise<void> {
	const data = await find('user'),
		data2 = search('id', id, data);
	if (!data2 || !data2['_id']) {
		const attributes = {};
		attributes[setting] = newValue;
		const Query2 = new userOptionsSchema({
			id,
			attributes
		});
		await Query2.save();
		return;
	}
	const settings = data2['settings'];
	settings[setting] = newValue;
	const Query = await userOptionsSchema.findByIdAndUpdate(data2['_id'], { settings });
	await Query.save();
	const index: number = findIndex('id', id, data);
	userCache = data;
	userCache[index]['settings'] = setting;
	return;
}

export = {
	globalGet,
	guildGet,
	userGet,
	globalUpdate,
	guildUpdate,
	userUpdate
};
