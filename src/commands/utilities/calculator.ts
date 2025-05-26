import {
	AllIntegrationTypes,
	AllInteractionContexts,
	AllowedMentions,
	BotCommand,
	colors,
	emojis,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType, EmbedBuilder, embedLength } from 'discord.js';
import { all, create, isResultSet } from 'mathjs';

const math = create(all);
math.import(
	{
		import() {
			throw new Error('import is disabled');
		},
		createUnit() {
			throw new Error('createUnit is disabled');
		},
		reviver() {
			throw new Error('reviver is disabled');
		}
	},
	{ override: true }
);

export default class CalculatorCommand extends BotCommand {
	public constructor() {
		super('calculator', {
			aliases: ['calculator', 'calc', 'math'],
			category: 'utilities',
			description: 'Calculates math expressions.',
			usage: ['calculator <expression>'],
			examples: ['calculator 9+10'],
			args: [
				{
					id: 'expression',
					description: 'The expression to calculate.',
					type: 'string',
					match: 'rest',
					prompt: 'What would you like to calculate?',
					retry: '{error} Pick something to calculate.',
					slashType: ApplicationCommandOptionType.String
				}
			],
			slash: true,
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: [],
			slashContexts: AllInteractionContexts,
			slashIntegrationTypes: AllIntegrationTypes,
			lock: 'user'
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { expression: string }) {
		const expr = args.expression.replaceAll('```', '').trim();

		// library is poorly typed
		/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
		const decodedEmbed = new EmbedBuilder().addFields({
			name: '📥 Input',
			value: await this.client.utils.inspectCleanRedactCodeblock(expr, 'mma')
		});
		try {
			const calculated = /^(9\s*?\+\s*?10)|(10\s*?\+\s*?9)$/.test(expr) ? '21' : math.evaluate(expr);
			decodedEmbed.setTitle(`${emojis.successFull} Successfully Calculated Expression`).setColor(colors.success);

			if (isResultSet(calculated) && calculated.entries.length <= 14) {
				for (const [i, result] of calculated.entries.entries()) {
					decodedEmbed.addFields({
						name: `📤 Output ${i + 1}`,
						value: await this.client.utils.inspectCleanRedactCodeblock(
							result.toString(),
							'mma',
							undefined,
							Math.min(1024, 6000 - embedLength(decodedEmbed.data))
						)
					});
				}
			} else {
				decodedEmbed.addFields({
					name: '📤 Output',
					value: await this.client.utils.inspectCleanRedactCodeblock(calculated.toString(), 'mma')
				});
			}
		} catch (error: any) {
			decodedEmbed
				.setTitle(`${emojis.errorFull} Unable to Calculate Expression`)
				.setColor(colors.error)
				.addFields({
					name: `📤 Error`,
					value: await this.client.utils.inspectCleanRedactCodeblock(`${error.name}: ${error.message}`, 'js')
				});
		}
		return await message.util.reply({ embeds: [decodedEmbed], allowedMentions: AllowedMentions.none() });
	}
}
