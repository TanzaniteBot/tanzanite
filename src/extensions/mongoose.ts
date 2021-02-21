import mongoose from 'mongoose';

const Schema = mongoose.Schema;
export const guildSchema = mongoose.model('guildSettings', new Schema({
	id: {
		type: String,
		required: true
	},
	settings: {
		type: Object,
		require: true
	},
}, { minimize: false }));

export const userSchema = mongoose.model('userSettings', new Schema({
	id: {
		type: String,
		required: true
	},
	settings:{
		type: Object,
		require: true
	},
}, { minimize: false }))

export const stickyRoleData = mongoose.model('stickyRoleData', new Schema({
	id: {
		type: String,
		required: true
	},
	left:{
		type: String,
		require: true
	},
	roles: {
		type: Array,
		required: true
	}
}, { minimize: false }))


export const globalSchema = mongoose.model('globalSettings', new Schema({
	id: {
		type: String,
		required: true
	},
	settings: {
		type: Object,
		require: true
	},
}, { minimize: false }));

export const botOptionsSchema = mongoose.model('botOptions', new Schema({
	environment: {
		type: String,
		require: true
	}, 
	disabledCommands: {
		type: Array,
		required: false
	},
	mainGuild: {
		type: String,
		require: false
	},
	dmChannel: {
		type: String,
		require: false
	},
	superUsers: {
		type: Array,
		require: false
	},
	channelBlacklist: {
		type: Array,
		require: false
	},
	userBlacklist: {
		type: Array,
		require: false
	},
	roleBlacklist: {
		type: Array,
		require: false
	},
	roleWhitelist: {
		type: Array,
		require: false
	},
}, { minimize: false }));