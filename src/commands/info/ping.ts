import { CommandHandler } from 'discord-akairo';
import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { runInThisContext } from 'vm';

export default class ReloadCommand extends Command {
    public constructor() {
        super('ping', {
            aliases: ['ping'],
            category: 'info',
            ratelimit: 4,
            cooldown: 4000,
        });
    };
    public async exec(message: Message) {
		const replyMsg: Message = await message.util.send("Pong!")
		const timestamp: number = (message.editedTimestamp) ? message.editedTimestamp : message.createdTimestamp;
		const latency = `\`\`\`\n ${Math.floor(replyMsg.createdTimestamp - timestamp)}ms \`\`\``;
		const apiLatency = `\`\`\`\n ${Math.round(message.client.ws.ping)}ms \`\`\``;
		const embed: MessageEmbed = new MessageEmbed()
			.setTitle('Pong!  🏓')
			.addField('Latency', latency, true)
			.addField('API Latency', apiLatency, true)
			.setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp();
		replyMsg.edit(embed);
    };
};