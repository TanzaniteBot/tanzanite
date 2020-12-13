import { Listener, Command } from 'discord-akairo';
import { MessageEmbed, Message } from 'discord.js';
import BotClient from '../../client/BotClient';

export default class CommandErrorListener extends Listener {
    public constructor() {
        super('commandError', {
            emitter: 'commandHandler',
            event: 'error',
            category: 'commands'
        });
    }

    public async exec(error: Error, message: Message, command: Command | null | undefined) {
		const errorEmbed: MessageEmbed = new MessageEmbed()
			.setTitle('A error occured')
			.setDescription(`**User:** PLACEHOLDER\n**Command:** PLACEHOLDER\n**Channel:** PLACEHOLDER`)
			.addField('Error', `${await this.client.consts.haste(error.stack)}`)
			.setColor('#1FD8F1')
			.setTimestamp();
		message.util.send(errorEmbed)
	}
};
