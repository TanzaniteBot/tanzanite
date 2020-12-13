import { Command, AkairoError } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import { Message } from 'discord.js';
import { inspect } from 'util';

const clean = text => {
	if (typeof (text) === "string")
		return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	else
		return text;
}

export default class EvalCommand extends Command {
	public constructor() {
		super('eval', {
			aliases: ['eval'],
			category: 'owner',
			description: {
				content: 'Use the command to eval stuff in the bot',
				usage: 'eval < code >',
				examples: [
					'eval message.guild.name',
					'eval this.client.ownerID'
				]
			},
			args: [
				{
					id: 'code',
					match: 'content',
					type: "string",
					prompt: {
						start: 'What would you like to eval?'
					}
				}
			],
			ratelimit: 4,
			cooldown: 4000,
			ownerOnly: true,
		});
	};

	public async exec(message: Message, { code }: { code: string }) {
		let embed: MessageEmbed = new MessageEmbed();
		try {
			let output = eval(code);
			if (typeof output !== 'string') output = inspect(output, { depth: 0 });
			output = output.replace(new RegExp(this.client.token, "g"), "[token ommited]")
			embed
				.setTitle('✅ Evaled code succefully')
				.addField('📥 Input', `\`\`\`js\n${code.length > 1024 ? 'Too large to display.' : code}\`\`\``)
				.addField('📤 Output', `\`\`\`js\n${output.length > 1024 ? 'Too large to display.' : output}\`\`\``)
				.setColor('#66FF00')
				.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
				.setTimestamp();
		} catch (e) {
			embed
				.setTitle('❌ Code was not able to be evaled')
				.addField('📥 Input', `\`\`\`js\n${code.length > 1024 ? 'Too large to display.' : code}\`\`\``)
				.addField('📤 Output', `\`\`\`js\n${e.length > 1024 ? 'Too large to display.' : e}\`\`\``)
				.setColor('#FF0000')
				.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
				.setTimestamp();
		}
		message.util.send(embed)
	};
};
