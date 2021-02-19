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

export const roleSchema = mongoose.model('role', new mongoose.Schema({
	userid: {
		type: String,
	},
	roleid: {
		type: {
			time: String,
		}
	},
}, { minimize: false }));