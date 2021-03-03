////import BotClient from '../extensions/BotClient';
import { globalOptionsSchema, guildOptionsSchema, userOptionsSchema } from '../extensions/mongoose';
import { environment } from '../config/botoptions';
import { inspect } from 'util';
import moment from 'moment';

type globalOptions =
	| 'disabledCommands'
	| 'mainGuild'
	| 'superUsers'
	| 'channelBlacklist'
	| 'userBlacklist'
	| 'roleBlacklist'
	| 'roleWhitelist'
	| 'dmChannel'
	| 'errorChannel'
	| 'generalLogChannel';
type guildOptions = 'prefix' | 'welcomeChannel' | 'autoPublishChannels';
type userOptions = 'autoRespond';

let globalCache: Array<unknown>, guildCache: Array<unknown>, userCache: Array<unknown>, lastGlobal: number, lastGuild: number, lastUser: number;

function search(key:string, value: string, Array: Array<unknown>){
	for (let i = 0; i < Array.length; i++) {
		if (Array[i] && Array[i][key]){
			if (Array[i][key] == value) {
				return Array[i];
			}
		}
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function find(type: 'global'|'guild'|'user'): Promise<any> {
	let schema;
	switch (type){
		case 'global':
			schema = globalOptionsSchema
			break
		case 'guild':
			schema = guildOptionsSchema
			break
		case 'user': 
			schema = userOptionsSchema
			break
		default:
			throw 'wat'
	}
	const now = Date.now()
	//check if last db fetch was more than 10 minutes ago or never happened
	if (!(eval(`last${type.charAt(0).toUpperCase() + type.slice(1)}`)) || moment(eval(`last${type.charAt(0).toUpperCase() + type.slice(1)}`)).isBefore(moment(now).subtract(10, 'minutes'))){ // if (!lastGlobal || moment(lastGlobal).isBefore(moment(now).subtract(10, 'minutes')))
		const data = await schema.find()
		eval(`${type}Cache = data;`); //globalCache = data
		eval(`last${type.charAt(0).toUpperCase() + type.slice(1)} = Date.now();`) //lastGlobal = Date.now()
		return data
	}else{
		return eval(`${type}Cache`) //return globalCache
	}
}

async function globalGet(setting: globalOptions, defaultValue: string | string[]): Promise<string | string[]> {
	const data = await find('global'),
		data2 = search('environment', environment, data)
	if (!data2 || !data2['settings'] || !data2['settings'][setting]) {
		console.warn('Had to use default value for global get.')
		return defaultValue;
	}
	return data2['settings'][setting];
}

async function guildGet(setting: guildOptions, id: string, defaultValue: string | string[]): Promise<string | string[]> {
	const data = await find('guild'), 
		data2 = search('id', id, data);
	if (!data2 || !data2['settings'][setting]) {
		console.warn('Had to use default value for guild get.')
		return defaultValue;
	}
	return data2['settings'][setting];
}

async function userGet(setting: userOptions, id: string, defaultValue: string | string[]): Promise<string | string[]> {
	const data = await find('guild'), 
		data2 = search('id', id, data);
	if (!data2 || !data2['settings'][setting]) {
		console.warn('Had to use default value for user get.')
		return defaultValue;
	}
	return data2['settings'][setting];
}

async function globalUpdate(setting: globalOptions, newValue: string | string[]): Promise<void> {
	let data;

	if (!lastGlobal || moment(lastGlobal).isBefore(moment(Date.now()).subtract(10, 'minutes'))) {
		data = await globalOptionsSchema.findOne({ environment });
		globalCache = data;
		lastGlobal = Date.now();
	} else {
		data = globalCache;
	}
	if (!data || !data['_id']) {
		const attributes = {};
		attributes[setting] = newValue;
		const Query2 = new globalOptionsSchema({
			environment,
			attributes,
		});
		await Query2.save();
		return;
	}
	const settings = data['settings'];
	settings[setting] = newValue;
	const Query = await globalOptionsSchema.findByIdAndUpdate(data['_id'], { settings });
	await Query.save();
	globalCache = data;
	globalCache['settings'] = settings;
	return;
}

async function guildUpdate(setting: guildOptions, newValue: string | string[], id: string): Promise<void> {
	let data;

	if (!lastGuild || moment(lastGuild).isBefore(moment(Date.now()).subtract(10, 'minutes'))) {
		data = await guildOptionsSchema.findOne({ id });
		guildCache = data;
		lastGuild = Date.now();
	} else {
		data = guildCache;
	}
	if (!data || !data['_id']) {
		const attributes = {};
		attributes[setting] = newValue;
		const Query2 = new guildOptionsSchema({
			id,
			attributes,
		});
		await Query2.save();
		return;
	}
	const settings = data['settings'];
	settings[setting] = newValue;
	const Query = await guildOptionsSchema.findByIdAndUpdate(data['_id'], { settings });
	await Query.save();
	guildCache = data;
	guildCache['settings'] = settings;
	return;
}

async function userUpdate(setting: userOptions, newValue: string | string[], id: string): Promise<void> {
	let data;

	if (!lastUser || moment(lastUser).isBefore(moment(Date.now()).subtract(10, 'minutes'))) {
		data = await userOptionsSchema.findOne({ id });
		userCache = data;
		lastUser = Date.now();
	} else {
		data = userCache;
	}
	if (!data || !data['_id']) {
		const attributes = {};
		attributes[setting] = newValue;
		const Query2 = new userOptionsSchema({
			id,
			attributes,
		});
		await Query2.save();
		return;
	}
	const settings = data['settings'];
	settings[setting] = newValue;
	const Query = await userOptionsSchema.findByIdAndUpdate(data['_id'], { settings });
	await Query.save();
	userCache = data;
	userCache['settings'] = setting;
	return;
}

export = {
	globalGet,
	guildGet,
	userGet,
	globalUpdate,
	guildUpdate,
	userUpdate,
};
