import mongoose from 'mongoose';

export const 
	Schema = mongoose.Schema,
	model = mongoose.model,
	stickyRoleDataSchema = model('stickyRoleData', new Schema({
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
	}, { minimize: false })),

	globalOptionsSchema = model('globalOptions', new Schema({
		environment: {
			type: String,
			require: true
		}, 
		settings: {
			disabledCommands: {
				type: Array,
				require: false
			},
			mainGuild: {
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
			dmChannel: {
				type: String,
				require: false
			},
			errorChannel: {
				type: String,
				require: false
			},
			generalLogChannel: {
				type: String,
				require: false
			},
			required: false
		},
	}, { minimize: false })),

	guildOptionsSchema = model('guildOptions', new Schema({
		id: {
			type: String,
			require: true
		},
		settings: {
			prefix: {
				type: String,
				require: false
			},
			required: false
		},
	}, { minimize: false })),

	userOptionsSchema = model('userOptions', new Schema({
		id: {
			type: String,
			require: true
		},
		settings: {
			autoRespond: {
				type: Boolean,
				require: false
			},
			require:false
		},
	}, { minimize: false }));
