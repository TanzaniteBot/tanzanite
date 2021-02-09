import { AkairoClient } from 'discord-akairo';
import mongoose from 'mongoose';


const Schema = mongoose.Schema;

export const guildSchema = mongoose.model('model', new Schema({
	id: {
		type: String,
		required: true
	},
	settings: {
		type: Object,
		require: true
	}
}, { minimize: false }));
