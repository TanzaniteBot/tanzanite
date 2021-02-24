////import BotClient from '../extensions/BotClient';
import { globalOptionsSchema, guildOptionsSchema, userOptionsSchema } from '../extensions/mongoose';
import { promisify } from 'util'
import { exists as fsExists } from 'fs'

type globalOptions = 'disabledCommands'| 'mainGuild'|'superUsers'|'channelBlacklist'|'userBlacklist'|'roleBlacklist'|'roleWhitelist'|'dmChannel'|'errorChannel'|'generalLogChannel';
type guildOptions = 'prefix'|'welcomeChannel'|'autoPublishChannels';
type userOptions = 'autoRespond'

const exists = promisify(fsExists)

const environment = async () => {
	if (await exists('../config/botoptions.ts')) {
		const options = await import('../config/botoptions')
		return options.environment
	}
}

async function globalGet(setting: globalOptions, defaultValue: string|string[]): Promise<string| string[]>{
	const data = await globalOptionsSchema.findOne({environment: await environment()})
	if ((!data) || (!data['settings'][setting])){
		return defaultValue
	}
	return data['settings'][setting]
}

async function guildGet(setting: guildOptions, id: string, defaultValue: string|string[]): Promise<string| string[]>{
	const data = await guildOptionsSchema.findOne({id})
	if ((!data) || (!data['settings'][setting])){
		return defaultValue
	}
	return data['settings'][setting]
}

async function userGet(setting: userOptions, id: string, defaultValue: string|string[]): Promise<string| string[]>{
	const data = await userOptionsSchema.findOne({id})
	if ((!data) || (!data['settings'][setting])){
		return defaultValue
	}
	return data['settings'][setting]
}

async function globalUpdate(setting: globalOptions, newValue: string|string[]): Promise<void>{
	const data = await globalOptionsSchema.findOne({environment: await environment()})
	if ((!data) || (!data['_id'])){
		const attributes = {}
		attributes[setting] = newValue
		const Query2 = new globalOptionsSchema({
			environment: await environment(), 
			attributes,
		})
		await Query2.save()
		return
	}
	const settings = data['settings']
	settings[setting] = newValue 
	const Query = await globalOptionsSchema.findByIdAndUpdate(data['_id'], {settings})
	await Query.save()
	return 
}

async function guildUpdate(setting: guildOptions, newValue: string|string[], id: string): Promise<void>{
	const data = await guildOptionsSchema.findOne({id})
	if ((!data) || (!data['_id'])){
		const attributes = {}
		attributes[setting] = newValue
		const Query2 = new guildOptionsSchema({
			id, 
			attributes,
		})
		await Query2.save()
		return
	}
	const settings = data['settings']
	settings[setting] = newValue 
	const Query = await guildOptionsSchema.findByIdAndUpdate(data['_id'], {settings})
	await Query.save()
	return
}

async function userUpdate(setting: userOptions, newValue: string|string[], id: string): Promise<void>{
	const data = await userOptionsSchema.findOne({id})
	if ((!data) || (!data['_id'])){
		const attributes = {}
		attributes[setting] = newValue
		const Query2 = new userOptionsSchema({
			id, 
			attributes,
		})
		await Query2.save()
		return
	}
	const settings = data['settings']
	settings[setting] = newValue 
	const Query = await userOptionsSchema.findByIdAndUpdate(data['_id'], {settings})
	await Query.save()
	return
}

export = {
	globalGet,
	guildGet,
	userGet,
	globalUpdate,
	guildUpdate,
	userUpdate
}