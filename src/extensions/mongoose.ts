import mongoose from 'mongoose';

const Schema = mongoose.Schema,
	model = mongoose.model;
export const
	stickyRoleDataSchema = model(
		'stickyRoleData',
		new Schema(
			{
				id: {
					type: String,
					required: true,
				},
				left: {
					type: String,
					required: true,
				},
				roles: {
					type: [String],
					required: true,
				},
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
				},
				settings: {
					disabledCommands: {
						type: [String],
						required: false,
					},
					mainGuild: {
						type: String,
						required: false,
					},
					superUsers: {
						type: [String],
						required: false,
					},
					channelBlacklist: {
						type: [String],
						required: false,
					},
					userBlacklist: {
						type: [String],
						required: false,
					},
					roleBlacklist: {
						type: [String],
						required: false,
					},
					roleWhitelist: {
						type: [String],
						required: false,
					},
					dmChannel: {
						type: String,
						required: false,
					},
					errorChannel: {
						type: String,
						required: false,
					},
					generalLogChannel: {
						type: String,
						required: false,
					},
					required: false,
				},
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
					required: true,
				},
				settings: {
					prefix: {
						type: String,
						required: false,
					},
					welcomeChannel: {
						type: String,
						required: false,
					},
					autoPublishChannels: {
						type: [String],
						required: false,
					},
					required: false,
				},
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
					required: true,
				},
				settings: {
					autoRespond: {
						type: Boolean,
						required: false,
					},
					required: false,
				},
			},
			{ minimize: false }
		)
	);
