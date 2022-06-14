// import { BushCommand, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
// import { ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
// import Fuse from 'fuse.js';

// export default class DebugCommand extends BushCommand {
// 	public constructor() {
// 		super('debug', {
// 			aliases: ['debug'],
// 			category: 'debug',
// 			description: 'Command description.',
// 			usage: ['template <requiredArg> [optionalArg]'],
// 			examples: ['template 1 2'],
// 			args: [
// 				{
// 					id: 'action',
// 					description: 'Debug action.',
// 					type: 'string',
// 					prompt: 'Debug action.',
// 					retry: '{error} Pick valid action.',
// 					slashType: ApplicationCommandOptionType.String,
// 					autocomplete: true
// 				}
// 			],
// 			slash: true,
// 			slashGuilds: ['516977525906341928'],
// 			superUserOnly: true,
// 			clientPermissions: (m) => util.clientSendAndPermCheck(m),
// 			userPermissions: []
// 		});
// 	}

// 	public override async exec(message: CommandMessage | SlashMessage, args: { action: ArgType<'string'> }) {
// 		if (args.action === 'util.reply') {
// 			return await message.util.reply(`This is a util.reply`);
// 		} else if (args.action === 'util.reply-object') {
// 			return await message.util.reply({
// 				content: `This is a util.reply with object parameters`,
// 				embeds: [{ description: 'And an embed' }]
// 			});
// 		} else if (args.action === 'util.send') {
// 			return await message.util.send(`This is a util.send`);
// 		} else if (args.action === 'util.send-object') {
// 			return await message.util.send({
// 				content: `This is a util.send with object parameters`,
// 				embeds: [{ description: 'And an embed' }]
// 			});
// 		} else if (args.action === 'interaction.reply') {
// 			return await (message.interaction as ChatInputCommandInteraction).reply(`This is a interaction.reply`);
// 		} else if (args.action === 'interaction.reply-object') {
// 			return await (message.interaction as ChatInputCommandInteraction).reply({
// 				content: `This is a interaction.reply with object parameters`,
// 				embeds: [{ description: 'And an embed' }]
// 			});
// 		} else {
// 			return await message.util.reply(`${util.emojis.error} Invalid action.`);
// 		}
// 	}

// 	public override autocomplete(interaction: AutocompleteInteraction) {
// 		const actions = [
// 			'util.reply',
// 			'util.reply-object',
// 			'util.send',
// 			'util.send-object',
// 			'interaction.reply',
// 			'interaction.reply-object'
// 		];

// 		const fuzzy = new Fuse(actions, {
// 			threshold: 0.5,
// 			isCaseSensitive: false,
// 			findAllMatches: true
// 		}).search(interaction.options.getFocused().toString());

// 		const res = fuzzy.slice(0, fuzzy.length >= 25 ? 25 : undefined).map((v) => ({ name: v.item, value: v.item }));

// 		void interaction.respond(res.length ? res : actions.map((v) => ({ name: v, value: v })));
// 	}
// }
