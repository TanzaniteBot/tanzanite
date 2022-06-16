// import { BushCommand, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
// import { ApplicationCommandOptionType, ComponentType } from 'discord.js';

// export default class PollCommand extends BushCommand {
// 	public constructor() {
// 		super('poll', {
// 			aliases: ['poll', 'quick-poll'],
// 			category: 'utilities',
// 			description: 'Allows you to create a poll that other users can vote on. Separate options with "," or "|".',
// 			usage: ['poll options'],
// 			examples: ['poll 1 2'],
// 			args: [
// 				{
// 					id: 'question',
// 					description: 'The question to be answered by a poll.',
// 					type: 'string',
// 					prompt: 'What question would you like to ask?',
// 					retry: '{error} Choose a question.',
// 					slashType: ApplicationCommandOptionType.String,
// 					only: 'slash'
// 				},
// 				{
// 					id: 'options',
// 					description: 'The options to include in the poll. Separate options with "," or "|".',
// 					type: 'string',
// 					prompt: 'What options you want to include in the poll? Separate options with "," or "|".',
// 					retry: '{error} Choose options for the poll. Separate options with "," or "|".',
// 					slashType: ApplicationCommandOptionType.String
// 				}
// 			],
// 			slash: true,
// 			clientPermissions: (m) => clientSendAndPermCheck(m),
// 			userPermissions: []
// 		});
// 	}

// 	public override async exec(message: CommandMessage | SlashMessage, args: { question?: string; options: ArgType<'string'> }) {
// 		const { question, options } = this.parseArgs(message, args);
// 		if (!question || !options.length) return;

// 		if (question.length > 256) return await message.util.reply(`${emojis.error} Question must be 256 characters or less.`);
// 		if (options.length > 10) return await message.util.reply(`${emojis.error} You can only have upto 10 options.`);

// 		return message.util.send({
// 			embeds: [
// 				{
// 					author: { name: `asked by: ${message.author.tag}`, icon_url: message.author.displayAvatarURL() || undefined },
// 					title: question
// 				}
// 			],
// 			components: [
// 				{
// 					type: ComponentType.ActionRow,
// 					components: []
// 				}
// 			]
// 		});
// 	}

// 	private parseArgs(
// 		message: CommandMessage | SlashMessage,
// 		args: { question?: string; options: ArgType<'string'> }
// 	): { question: string; options: string[] } {
// 		const split = args.options.split(/[,|]/).filter((s) => s.trim().length > 0);
// 		if (message.util.isSlash) {
// 			if (split.length < 2) {
// 				void message.util.reply(`${emojis.error} You must provide at least two options.`);
// 				return { question: '', options: [] };
// 			}
// 			return { question: args.question!, options: split };
// 		} else {
// 			if (split.length < 3) {
// 				void message.util.reply(`${emojis.error} You must provide a question and at least two options.`);
// 				return { question: '', options: [] };
// 			}

// 			return { question: split[0], options: split.slice(1) };
// 		}
// 	}
// }
