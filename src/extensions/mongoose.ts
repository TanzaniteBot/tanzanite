import mongoose from 'mongoose';


const Schema = mongoose.Schema,
	guildSchema = new Schema({
		id: {
			type: String,
			required: true
		},
		settings: {
			type: Object,
			require: true
		}
	}, { minimize: false });

module.exports = mongoose.model('model', guildSchema);