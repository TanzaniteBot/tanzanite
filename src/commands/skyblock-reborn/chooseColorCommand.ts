import { AllowedMentions, BushCommand, BushGuildMember, BushMessage, BushSlashMessage } from '@lib';
import { Constants } from 'discord-akairo';
import { CommandInteraction, Role, RoleResolvable, Snowflake } from 'discord.js';

const roleColorMap = [
	{
		name: 'Brown',
		value: '840952499883737108'
	},
	{
		name: 'Dark Red',
		value: '840952434574229546'
	},
	{
		name: 'Red',
		value: '840952208552230913'
	},
	{
		name: 'Pink',
		value: '840952722681364531'
	},
	{
		name: 'Hot Pink',
		value: '840952638309007412'
	},
	{
		name: 'Yellow',
		value: '840952282598473778'
	},
	{
		name: 'Gold',
		value: '840952256764313610'
	},
	{
		name: 'Light Green',
		value: '846394838744170517'
	},
	{
		name: 'Green',
		value: '840952308702642206'
	},
	{
		name: 'Sea Green',
		value: '840952901853511690'
	},
	{
		name: 'Forest Green',
		value: '840952382510858260'
	},
	{
		name: 'Dark Green',
		value: '840952336339042315'
	},
	{
		name: 'Blue',
		value: '840952833200750682'
	},
	{
		name: 'Dark Blue',
		value: '840952875734532137'
	},
	{
		name: 'Blurple',
		value: '853037502188617778'
	},
	{
		name: 'Wizard Purple',
		value: '840952750816755723'
	},
	{
		name: 'White',
		value: '840953158276743208'
	},
	{
		name: 'Dark Mode',
		value: '840953434785710110'
	},
	{
		name: 'Black',
		value: '840953275326660629'
	}
];
export default class ChooseColorCommand extends BushCommand {
	public constructor() {
		super('chooseColor', {
			aliases: ['choosecolor'],
			category: 'Skyblock: Reborn',
			description: {
				content: 'Choose a color.',
				usage: 'color <color>',
				examples: ['report IRONM00N']
			},
			args: [
				{
					id: 'color',
					type: Constants.ArgumentTypes.ROLE,
					match: Constants.ArgumentMatches.REST,
					prompt: {
						start: 'Please choose a valid color.',
						retry: `{error} Provide what did they do wrong.`,
						optional: true
					}
				}
			],
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			channel: 'guild',
			restrictedGuilds: ['839287012409999391'],
			slash: true,
			slashGuilds: ['839287012409999391'],
			slashOptions: [
				{
					name: 'color',
					description: 'The color you would like to have.',
					type: 'STRING',
					choices: roleColorMap,
					required: true
				}
			]
		});
	}

	public async exec(message: BushMessage | BushSlashMessage, args: { color: Role | RoleResolvable }): Promise<unknown> {
		if (message.guild.id != client.consts.mappings.guilds.sbr) {
			return await message.util.reply(`${util.emojis.error} This command can only be run in Skyblock: Reborn.`);
		}
		const allowedRoles: Snowflake[] = [
			'839317526395879449', //Server Booster
			'840949387534008360' //Mega Donator
		];

		if (
			!(
				allowedRoles.some((role) => (message.member as BushGuildMember).roles.cache.has(role)) ||
				(message.member as BushGuildMember).permissions.has('ADMINISTRATOR') ||
				message.guild.ownerId === message.author.id
			)
		) {
			const allowed = util.oxford(
				allowedRoles.map((id) => `<@&${id}>s`),
				'and',
				''
			);
			return await message.util.reply({
				content: `${util.emojis.error} Only ${allowed} can use this command.`,
				allowedMentions: AllowedMentions.none(),
				ephemeral: true
			});
		}
		if (message.util.isSlash) await (message.interaction as CommandInteraction).defer();
		// new Array(
		// 	roleColorMap.map(obj => obj.name.toLowerCase()),
		// 	roleColorMap.map(obj => obj.value)
		// );
		const colorID = message.util.isSlash ? (args.color as string) : (args.color as Role).id;
		if (!roleColorMap.map((obj) => obj.value).includes(colorID)) {
			return await message.util.reply({
				content: `${util.emojis.error} ${args.color} is not a whitelisted color role.`,
				allowedMentions: AllowedMentions.none()
			});
		}
		const memberColorRoles = (message.member as BushGuildMember).roles.cache.filter((role) =>
			roleColorMap.map((obj) => obj.value).includes(role.id)
		);

		await (message.member as BushGuildMember).roles.add(args.color, 'Choose Color Command.');

		if (memberColorRoles.size) {
			memberColorRoles.forEach(
				(role) => (message.member as BushGuildMember).roles.remove(role),
				'Removing Duplicate Color Roles.'
			);
		}

		return await message.util.reply({
			content: `${util.emojis.success} Assigned you the <@&${colorID}> role.`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
