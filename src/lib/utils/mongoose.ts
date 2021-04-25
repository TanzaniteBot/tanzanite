import mongoose from 'mongoose';

//TODO: Finish typings and stuff
export interface stickyRoleData {
	id: string;
	left: string;
	roles: Array<string>;
	nickname?: string;
}

export interface globalOptions {
	environment: string;
	settings?: globalSettings;
}

interface globalSettings {
	disabledCommands: Array<string>;
	mainGuild: string;
	superUsers: Array<string>;
	channelBlacklist: Array<string>;
	userBlacklist: Array<string>;
	roleBlacklist: Array<string>;
	roleWhitelist: Array<string>;
	dmChannel: string;
	errorChannel: string;
	generalLogChannel: string;
}

export interface guildOptions {
	id: string;
	settings?: guildSettings;
}

interface guildSettings {
	prefix?: string;
	welcomeChannel?: string;
	autoPublishChannels?: Array<string>;
	welcomeRoles?: Array<string>;
}

export interface userOptions {
	id: string;
	settings: userSettings;
}

interface userSettings {
	autoRespond: boolean;
}

const Schema = mongoose.Schema,
	model = mongoose.model;
export const stickyRoleDataSchema = model(
		'stickyRoleData',
		new Schema(
			{
				id: {
					type: String,
					required: true
				},
				left: {
					type: String,
					required: true
				},
				roles: {
					type: [String],
					required: true
				}
			},
			{ minimize: false }
		)
	),
	//remember to update the functions if you change one of these options

	globalOptionsSchema = model(
		'globalOptions',
		new Schema(
			{
				environment: {
					type: String,
					required: true,
					unique: true
				},
				settings: {
					disabledCommands: {
						type: [String],
						required: true
					},
					mainGuild: {
						type: String,
						required: true
					},
					superUsers: {
						type: [String],
						required: true
					},
					channelBlacklist: {
						type: [String],
						required: true
					},
					userBlacklist: {
						type: [String],
						required: true
					},
					roleBlacklist: {
						type: [String],
						required: true
					},
					roleWhitelist: {
						type: [String],
						required: true
					},
					dmChannel: {
						type: String,
						required: true
					},
					errorChannel: {
						type: String,
						required: true
					},
					generalLogChannel: {
						type: String,
						required: true
					},
					specialGuilds: {
						type: [String],
						required: true
					},
					required: false
				}
			},
			{ minimize: false }
		)
	),
	guildOptionsSchema = model(
		'guildOptions',
		new Schema(
			{
				id: {
					type: String,
					required: true
				},
				settings: {
					prefix: {
						type: String,
						required: false,
						default: '-'
					},
					welcomeChannel: {
						type: String,
						required: false,
						default: undefined
					},
					autoPublishChannels: {
						type: [String],
						required: false,
						default: undefined
					},
					welcomeRoles: {
						type: [String],
						required: false,
						default: undefined
					},
					required: false
				}
			},
			{ minimize: false }
		)
	),
	userOptionsSchema = model(
		'userOptions',
		new Schema(
			{
				id: {
					type: String,
					required: true
				},
				settings: {
					autoRespond: {
						type: Boolean,
						required: false
					},
					required: false
				}
			},
			{ minimize: false }
		)
	);
