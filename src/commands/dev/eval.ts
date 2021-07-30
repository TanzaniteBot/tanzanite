import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { exec } from 'child_process';
import { MessageEmbed as _MessageEmbed } from 'discord.js';
import { transpile } from 'typescript';
import { promisify } from 'util';

export default class EvalCommand extends BushCommand {
	public constructor() {
		super('eval', {
			aliases: ['eval', 'ev', 'evaluate'],
			category: 'dev',
			description: {
				content: 'Evaluate code.',
				usage: 'eval <code> [--depth #] [--sudo] [--silent] [--delete] [--proto] [--hidden] [--ts]',
				examples: ['eval message.channel.delete()']
			},
			args: [
				{ id: 'sel_depth', match: 'option', type: 'integer', flag: '--depth', default: 0 },
				{ id: 'sudo', match: 'flag', flag: '--sudo' },
				{ id: 'delete_msg', match: 'flag', flag: '--delete' },
				{ id: 'silent', match: 'flag', flag: '--silent' },
				{ id: 'typescript', match: 'flag', flag: '--ts' },
				{ id: 'hidden', match: 'flag', flag: '--hidden' },
				{ id: 'show_proto', match: 'flag', flag: '--proto' },
				{
					id: 'code',
					match: 'rest',
					type: 'string',
					prompt: { start: 'What would you like to eval?', retry: '{error} Invalid code to eval.' }
				}
			],
			slash: true,
			slashOptions: [
				{ name: 'code', description: 'The code you would like to evaluate.', type: 'STRING', required: true },
				{ name: 'sel_depth', description: 'How deep to display the output.', type: 'INTEGER', required: false },
				{ name: 'sudo', description: 'Whether or not to override checks.', type: 'BOOLEAN', required: false },
				{ name: 'silent', description: 'Whether or not to make the response silent', type: 'BOOLEAN', required: false },
				{ name: 'typescript', description: 'Whether or not the code is typescript.', type: 'BOOLEAN', required: false },
				{ name: 'hidden', description: 'Whether or not to show hidden items.', type: 'BOOLEAN', required: false },
				{ name: 'show_proto', description: 'Show prototype.', type: 'BOOLEAN', required: false }
			],
			ownerOnly: true
		});
	}

	public async exec(
		message: BushMessage | BushSlashMessage,
		args: {
			sel_depth: number;
			code: string;
			sudo: boolean;
			silent: boolean;
			deleteMSG: boolean;
			typescript: boolean;
			hidden: boolean;
			show_proto: boolean;
		}
	): Promise<unknown> {
		if (!message.author.isOwner())
			return await message.util.reply(`${util.emojis.error} Only my developers can run this command.`);
		if (message.util.isSlash) {
			await (message as BushSlashMessage).interaction.defer({ ephemeral: args.silent });
		}
		args.code = args.code.replace(/[“”]/g, '"').replace(/```*(?:js|ts)?/g, '');

		const code = {
			ts: args.typescript ? args.code : null,
			js: args.typescript ? transpile(args.code) : args.code,
			lang: args.typescript ? 'ts' : 'js'
		};

		const embed = new _MessageEmbed();
		const badPhrases = ['delete', 'destroy'];

		if (badPhrases.some((p) => code[code.lang].includes(p)) && !args.sudo) {
			return await message.util.send(`${util.emojis.error} This eval was blocked by smooth brain protection™.`);
		}

		/* eslint-disable @typescript-eslint/no-unused-vars */
		const sh = promisify(exec),
			me = message.member,
			member = message.member,
			bot = client,
			guild = message.guild,
			channel = message.channel,
			config = client.config,
			members = message.guild?.members,
			roles = message.guild?.roles,
			emojis = util.emojis,
			colors = util.colors,
			{ ActivePunishment, Global, Guild, Level, ModLog, StickyRole } = await import('@lib'),
			{
				ButtonInteraction,
				Collector,
				CommandInteraction,
				Interaction,
				Message,
				MessageActionRow,
				MessageAttachment,
				MessageButton,
				MessageCollector,
				InteractionCollector,
				MessageEmbed,
				MessageSelectMenu,
				ReactionCollector,
				Util,
				Collection
			} = await import('discord.js'),
			{ Canvas } = await import('canvas');
		/* eslint-enable @typescript-eslint/no-unused-vars */

		const inputJS = await util.inspectCleanRedactCodeblock(code.js, 'js');
		const inputTS = code.lang === 'ts' ? await util.inspectCleanRedactCodeblock(code.ts, 'ts') : undefined;
		try {
			const rawOutput = code[code.lang].replace(/ /g, '').includes('9+10' || '10+9') ? '21' : await eval(code.js);
			const output = await util.inspectCleanRedactCodeblock(rawOutput, 'js', {
				depth: args.sel_depth || 0,
				showHidden: args.hidden,
				getters: true,
				showProxy: true
			});
			const proto = args.show_proto
				? await util.inspectCleanRedactCodeblock(Object.getPrototypeOf(rawOutput), 'js', {
						depth: 1,
						getters: true,
						showHidden: true
				  })
				: undefined;

			embed.setTitle(`${emojis.successFull} Evaluated code successfully`).setColor(colors.success);
			if (inputTS) embed.addField('📥 Input (typescript)', inputTS).addField('📥 Input (transpiled javascript)', inputJS);
			else embed.addField('📥 Input', inputJS);
			embed.addField('📤 Output', output);
			if (proto) embed.addField('⚙️ Proto', proto);
		} catch (e) {
			embed.setTitle(`${emojis.errorFull} Code was not able to be evaluated.`).setColor(colors.error);
			if (inputTS) embed.addField('📥 Input (typescript)', inputTS).addField('📥 Input (transpiled javascript)', inputJS);
			else embed.addField('📥 Input', inputJS);
			embed.addField('📤 Output', await util.inspectCleanRedactCodeblock(e?.stack || e, 'js'));
		}

		embed.setTimestamp().setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true }));

		if (!args.silent || message.util.isSlash) {
			await message.util.reply({ embeds: [embed] });
		} else {
			try {
				await message.author.send({ embeds: [embed] });
				if (!args.deleteMSG) await (message as BushMessage).react(emojis.successFull);
			} catch {
				if (!args.deleteMSG) await (message as BushMessage).react(emojis.errorFull);
			}
		}
		if (args.deleteMSG && (message as BushMessage).deletable) await (message as BushMessage).delete();
	}
}
