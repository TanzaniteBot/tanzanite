import { BotCommand }from '../../extensions/BotCommand';
import { MessageEmbed, Message } from 'discord.js';
import { inspect}from 'util';
import mongoose from 'mongoose';
import got from 'got/dist/source';
import { config }from 'process';
import { stickyRoleDataSchema, globalOptionsSchema, guildOptionsSchema, userOptionsSchema } from '../../extensions/mongoose';
import db from '../../constants/db'

const clean = (text) => {
	if (typeof text === 'string') return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
	else return text;
};

export default class EvalCommand extends BotCommand {
	public constructor() {
		super('eval', {
			aliases: ['eval', 'ev'],
			category: 'dev',
			description: {
				content: 'Use the command to eval stuff in the bot.', 
				usage: 'eval [--depth #] <code> [--sudo] [--silent] [--delete]',
				examples: ['eval message.guild.name', 'eval this.client.ownerID'],
			},
			args: [
				{
					id: 'selDepth',
					match: 'option',
					type: 'number',
					flag: '--depth',
					default: 0,
				},
				{
					id: 'sudo',
					match: 'flag',
					flag: '--sudo',
				},
				{
					id: 'deleteMSG',
					match: 'flag',
					flag: '--delete',
				},
				{
					id: 'silent',
					match: 'flag',
					flag: '--silent',
				},
				{
					id: 'code',
					match: 'rest',
					type: 'string',
					prompt: {
						start: 'What would you like to eval?',
					},
				},
			],
			ratelimit: 4,
			cooldown: 4000,
			ownerOnly: true,
		});
	}

	public async exec(
		message: Message,
		{ selDepth, code, sudo, silent, deleteMSG }: { selDepth: number, code: string; sudo: boolean; silent: boolean; deleteMSG: boolean }
	): Promise<void> {
		if (!(this.client.config.owners.includes(message.author.id))){ 
			await message.channel.send('Only owners can use this command.')
			return
		} 
		const embed: MessageEmbed = new MessageEmbed();
		const bad_phrases: string[] = ['delete', 'destroy'];

		if (bad_phrases.some((p) => code.includes(p)) && !sudo) {
			await message.util.send('This eval was blocked by smooth brain protection™.');
			return;
		}
		/*if (code.includes('require("fs")' || 'require("fs")' || 'attach:')) {
			await message.util.send('<a:ahhhhhh:783874018775138304> Stop looking through my files!');
			return;
		}*/

		try {
			let output;
			/* eslint-disable no-unused-vars */
			// noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols,JSUnusedLocalSymbols,JSUnusedLocalSymbols,JSUnusedLocalSymbols
			const me = message.member,
				member = message.member,
				bot = this.client,
				guild = message.guild,
				channel = message.channel,
				db = mongoose.connection,
				config = this.client.config;
			if (code.replace(/ /g, '').includes('9+10' || '10+9')) {
				output = 21;
			} else {
				output = eval(code);
				output = await output;
			}
			if (typeof output !== 'string') output = inspect(output, { depth: selDepth });
			output = output.replace(new RegExp(this.client.credentials.token, 'g'), '[token Omitted]');
			output = output.replace(new RegExp([...this.client.credentials.token].reverse().join(''), 'g'), '[token Omitted]');
			output = output.replace(new RegExp(this.client.credentials.MongoDB.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '[MongoDB URI Omitted]'); 
			output = output.replace(new RegExp([...this.client.credentials.MongoDB.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')].reverse().join(''), 'g'), '[MongoDB URI Omitted]'); 
			output = output.replace(new RegExp(this.client.credentials.hypixelApiKey.toString(), 'g'), '[Hypixel Api Key Omitted]'); 
			output = output.replace(new RegExp([...this.client.credentials.hypixelApiKey.toString()].reverse().join(''), 'g'), '[Hypixel Api Key Omitted]'); 
			output = clean(output);
			embed
				.setTitle('✅ Evaled code successfully')
				.addField(
					'📥 Input',
					code.length > 1012 ? 'Too large to display. Hastebin: ' + (await this.client.consts.haste(code)) : '```js\n' + code + '```'
				)
				.addField(
					'📤 Output',
					output.length > 1012 ? 'Too large to display. Hastebin: ' + (await this.client.consts.haste(output)) : '```js\n' + output + '```'
				)
				.setColor('#66FF00')
				.setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
				.setTimestamp();
		} catch (e) {
			embed
				.setTitle('❌ Code was not able to be evaled')
				.addField(
					'📥 Input',
					code.length > 1012 ? 'Too large to display. Hastebin: ' + (await this.client.consts.haste(code)) : '```js\n' + code + '```'
				)
				.addField(
					'📤 Output',
					e.length > 1012
						? 'Too large to display. Hastebin: ' + (await this.client.consts.haste(e))
						: '```js\n' + e + '```Full stack:' + (await this.client.consts.haste(e.stack))
				)
				.setColor('#FF0000')
				.setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
				.setTimestamp();
		}
		if (!silent) {
			await message.util.send(embed);
		} else {
			try {
				await message.author.send(embed);
				if (!deleteMSG) {
					await message.react('<a:Check_Mark:790373952760971294>');
				}
			} catch (e) {
				if (!deleteMSG) {
					await message.react('❌');
				}
			}
		}

		if (deleteMSG) {
			if (message.deletable) {
				await message.delete();
			}
		}
	}
}
