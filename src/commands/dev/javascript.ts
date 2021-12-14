import { BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import { MessageEmbed } from 'discord.js';
import { VM } from 'vm2';

export default class JavascriptCommand extends BushCommand {
	public constructor() {
		super('javascript', {
			aliases: ['javascript', 'js'],
			category: 'dev',
			description: 'Evaluate code in a sand boxed environment.',
			usage: ['javascript <code> [--depth #]'],
			examples: ['javascript 9+10'],
			args: [
				{
					id: 'code',
					description: 'The code you would like to run in a sand boxed environment.',
					match: 'rest',
					prompt: 'What code would you like to run in a sand boxed environment?',
					retry: '{error} Invalid code to run in a sand boxed environment.',
					slashType: 'STRING',
					only: 'slash'
				},
				{
					id: 'sel_depth',
					description: 'How deep to inspect the output.',
					match: 'option',
					type: 'integer',
					flag: '--depth',
					default: 0,
					prompt: 'How deep would you like to inspect the output?',
					slashType: 'INTEGER',
					optional: true
				},
				{
					id: 'code',
					description: 'The code you would like to run in a sand boxed environment.',
					match: 'rest',
					prompt: 'What code would you like to run in a sand boxed environment?',
					retry: '{error} Invalid code to run in a sand boxed environment.',
					slashType: 'STRING',
					only: 'text'
				}
			],
			slash: true,
			superUserOnly: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: {
			sel_depth: number;
			code: string;
		}
	) {
		if (!message.author.isSuperUser())
			return await message.util.reply(`${util.emojis.error} Only super users can run this command.`);
		if (message.util.isSlashMessage(message)) {
			await message.interaction.deferReply({ ephemeral: false });
		}
		const code = args.code.replace(/[“”]/g, '"').replace(/```*(?:js)?/g, '');
		const embed = new MessageEmbed();
		const input = await util.inspectCleanRedactCodeblock(code, 'js');

		try {
			const rawOutput = /^(9\s*?\+\s*?10)|(10\s*?\+\s*?9)$/.test(code)
				? '21'
				: new VM({ eval: true, wasm: true, timeout: 1_000, fixAsync: true }).run(`${code}`);
			const output = await util.inspectCleanRedactCodeblock(rawOutput, 'js', {
				depth: args.sel_depth ?? 0,
				getters: true,
				inspectStrings: true
			});

			embed.setTitle(`${util.emojis.successFull} Successfully Evaluated Expression`).setColor(util.colors.success);
			embed.addField('📥 Input', input);
			embed.addField('📤 Output', output);
		} catch (e) {
			embed.setTitle(`${util.emojis.errorFull} Unable to Evaluate Expression`).setColor(util.colors.error);
			embed.addField('📥 Input', input);
			embed.addField('📤 Error', await util.inspectCleanRedactCodeblock(e, 'js'));
		}

		embed.setTimestamp().setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true }) ?? undefined);

		await message.util.reply({ embeds: [embed] });
	}
}
