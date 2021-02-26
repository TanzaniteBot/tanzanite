////import BotClient from '../extensions/BotClient';
import { globalOptionsSchema, guildOptionsSchema, userOptionsSchema } from '../extensions/mongoose';
import { environment } from '../config/botoptions';
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

const cacheTime = '10 minutes';

let globalCache, guildCache, userCache, lastGlobal, lastGuild, lastUser;

async function globalGet(setting: globalOptions, defaultValue: string | string[]): Promise<string | string[]> {
	let data;

	if (!lastGlobal || moment(lastGlobal).isBefore(moment(Date.now()).subtract(cacheTime))) {
		//check if last db fetch was more than 10 minutes ago or never happened
		data = await globalOptionsSchema.findOne({ environment });
		globalCache = data;
		lastGlobal = Date.now();
	} else {
		data = globalCache;
	}
	if (!data || !data['settings'][setting]) {
		return defaultValue;
	}
	return data['settings'][setting];
}

async function guildGet(setting: guildOptions, id: string, defaultValue: string | string[]): Promise<string | string[]> {
	let data;

	if (!lastGuild || moment(lastGuild).isBefore(moment(Date.now()).subtract(cacheTime))) {
		data = await guildOptionsSchema.findOne({ id });
		guildCache = data;
		lastGuild = Date.now();
	} else {
		data = guildCache;
	}
	if (!data || !data['settings'][setting]) {
		return defaultValue;
	}
	return data['settings'][setting];
}

async function userGet(setting: userOptions, id: string, defaultValue: string | string[]): Promise<string | string[]> {
	let data;

	if (!lastUser || moment(lastUser).isBefore(moment(Date.now()).subtract(cacheTime))) {
		data = await userOptionsSchema.findOne({ id });
		userCache = data;
		lastUser = Date.now();
	} else {
		data = userCache;
	}

	if (!data || !data['settings'][setting]) {
		return defaultValue;
	}
	return data['settings'][setting];
}

async function globalUpdate(setting: globalOptions, newValue: string | string[]): Promise<void> {
	let data;

	if (!lastGlobal || moment(lastGlobal).isBefore(moment(Date.now()).subtract(cacheTime))) {
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
	console.log(data);
	console.log('=========================================================');
	console.log(globalCache);
	console.log('=========================================================');
	return;
}

async function guildUpdate(setting: guildOptions, newValue: string | string[], id: string): Promise<void> {
	const data = await guildOptionsSchema.findOne({ id });
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
	return;
}

async function userUpdate(setting: userOptions, newValue: string | string[], id: string): Promise<void> {
	const data = await userOptionsSchema.findOne({ id });
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
