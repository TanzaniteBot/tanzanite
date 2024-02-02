import { Arg, BotCommand, emojis, type ArgType, type CommandMessage } from '#lib';
import type { AkairoMessage, ArgumentGeneratorReturn } from '@tanzanite/discord-akairo';
import { ApplicationCommandOptionType, Message, Role } from 'discord.js';
import assert from 'node:assert/strict';
import tinycolor from 'tinycolor2';
import { colorToDecimal } from '../info/color.js';

type Msg = CommandMessage<true> | AkairoMessage<'cached'>;

export default class ColorRoleCommand extends BotCommand {
	#colorRoleMatch = /#[0-9a-f]{6}/;
	#divRoleName = '[tanzanite] color-pos';

	public constructor() {
		super('colorRole', {
			aliases: ['color-role', 'use-color-role', 'color-role-use', 'remove-color-role', 'color-role-remove'],
			category: 'specialized',
			description: 'Choose a custom role color',
			usage: [
				'color-role use <color>',
				'use-color-role <color>',
				'color-role-use <color>',
				'color-role remove',
				'remove-color-role',
				'color-role-remove'
			],
			examples: ['color-role use #17e2f0', 'remove-color-role'],
			helpArgs: [
				{
					name: 'action',
					description: 'Whether to use a color or to remove it',
					type: '"use"|"remove"'
				},
				{
					name: 'color',
					description: 'The color of the role (if action is "use")',
					type: 'color'
				}
			],
			slashOptions: [
				{
					name: 'use',
					description: 'Use a (new) role color.',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'color',
							description: 'What color would you like the role to be? Use /color to display.',
							type: ApplicationCommandOptionType.String,
							required: true
						}
					]
				},
				{
					name: 'remove',
					description: 'Remove your current role color.',
					type: ApplicationCommandOptionType.Subcommand
				}
			],
			slash: true,
			clientPermissions: ['ManageRoles', 'EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: [],
			channel: 'guild',
			restrictedGuilds: ['1148411253388226590']
		});
	}

	public override *args(message: CommandMessage): ArgumentGeneratorReturn {
		const alias = message.util.parsed?.alias ?? '';

		const useAliases = ['use-color-role', 'color-role-use'] as const;
		const removeAliases = ['remove-color-role', 'color-role-remove'] as const;

		const action = useAliases.includes(alias)
			? 'use'
			: removeAliases.includes(alias)
				? 'remove'
				: yield {
						type: ['use', 'remove'],
						prompt: {
							start: 'Would you like to `use` or `remove` a color role?',
							retry: '{error} Choose whether you would you like to `use` or `remove` a color role.'
						}
					};

		if (action === 'remove') {
			return { action };
		}

		const color = yield {
			type: 'tinyColor',
			prompt: {
				start: 'What color code to find use for your role color?',
				retry: '{error} Choose a valid css color.'
			}
		};

		return { action, color };
	}

	public override async exec(
		message: CommandMessage<true>,
		args: { action: 'use'; color: ArgType<'tinyColor'> } | { action: 'remove' }
	) {
		if (message.guild == null) return message.util.reply(`${emojis.error} Cannot be used in DMs.`);
		if (args.action === 'remove') {
			void this.#removeColorRole(message);
		} else {
			void this.#useColorRole(message, args.color);
		}
	}

	public override async execSlash(
		message: AkairoMessage<'cached'>,
		args: { subcommand: 'use'; color: string } | { subcommand: 'remove' }
	) {
		if (message.guild == null) return message.util.reply(`${emojis.error} Cannot be used in DMs.`);

		await message.interaction.deferReply();

		if (args.subcommand === 'remove') {
			await this.#removeColorRole(message);
		} else {
			const color = await Arg.cast('tinyColor', message, args.color);

			if (color == null) {
				return message.util.reply(`${emojis.error} Invalid color provided. Use the \`/color\` command preview valid colors.`);
			}

			await this.#useColorRole(message, color);
		}
	}

	async #removeColorRole(message: Msg) {
		const colorRole = message.member?.roles.color;

		if (!colorRole) {
			return message.util.reply(`${emojis.error} You do not seem to have any color roles.`);
		}

		if (!colorRole.name.match(this.#colorRoleMatch)) {
			return message.util.reply(
				`${emojis.error} You have a role that gives you color but its name isn't in the correct form so I will not manage it.`
			);
		}

		if (!colorRole.editable) {
			return message.util.reply(`${emojis.error} I do not have a high enough role to manage your color role.`);
		}

		try {
			await message.member.roles.remove(colorRole);
		} catch {
			return message.util.reply(`${emojis.error} There was an error removing your color role.`);
		}

		const cleanedUp = await this.#cleanUpRole(colorRole);

		return message.util.reply(`${emojis.success} Successfully removed your color role${cleanedUp ? ' and deleted it' : ''}.`);
	}

	async #useColorRole(message: Msg, inputColor: ArgType<'tinyColor'>) {
		const color = tinycolor(inputColor);
		const hex = color.toHexString();
		const decimal = colorToDecimal(color);

		assert(hex.match(this.#colorRoleMatch));

		const colorRole = message.member?.roles.color;

		if (colorRole?.name === hex && colorRole?.color === decimal) {
			return message.util.reply(`${emojis.warn} You already have that color role.`);
		}

		let role: Role;

		if (colorRole?.name.match(this.#colorRoleMatch) && colorRole.members.size === 1 && colorRole.editable) {
			role = colorRole;
		} else {
			const newRole = await this.#newColorRole(message, hex, decimal);
			if (newRole instanceof Message) return;
			role = newRole;
		}

		if (role.name !== hex || role.color !== decimal) {
			await role.edit({
				reason: 'Reusing old color role',
				name: hex,
				color: decimal
			});
		}

		if (!role.members.has(message.author.id)) {
			try {
				await message.member?.roles.add(role, 'Color role');
			} catch (e) {
				if (message.author.isOwner()) {
					throw e;
				}
				return message.util.reply(`${emojis.error} Error adding color role`);
			}
		}

		return message.util.reply(`${emojis.success} Successfully set your color role to **${hex}**`);
	}

	async #newColorRole(message: Msg, hex: string, decimal: number): Promise<Role | Message> {
		const existingRole = message.guild.roles.cache.find((r) => r.name === hex && r.color === decimal);

		if (existingRole) return existingRole;

		const divRole = message.guild.roles.cache.find((r) => r.name === this.#divRoleName);
		if (divRole == null) {
			return message.util.reply(
				`${emojis.error} Cannot find a divider role. Makes sure there is a role named "${this.#divRoleName}"`
			);
		}

		let ret;
		try {
			ret = await message.guild.roles.create({
				name: hex,
				color: decimal,
				position: divRole.position,
				permissions: 0n
			});
		} catch (e) {
			if (message.author.isOwner()) {
				throw e;
			}

			return message.util.reply(`${emojis.error} There was an issue creating your new color role.`);
		}

		return ret;
	}

	async #cleanUpRole(role: Role) {
		if (!role.name.match(this.#colorRoleMatch)) return false;

		const { members } = role;

		if (members.size !== 0) return false;

		await role.delete('Unused color role.');

		return true;
	}
}
