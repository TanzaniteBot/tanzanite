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