import { Message } from "discord.js";
import moment from "moment";
import { BotListener } from "../../extensions/BotListener";

export default class StalkerListener extends BotListener {
	public constructor() {
		super('StalkerListener', {
			emitter: 'client',
			event: 'message',
			category: 'message'
		});
	}

	public async exec(message: Message): Promise<void> {
		const lastMessage = moment(message.author.lastMessage.createdTimestamp);
		const currentTime = moment(Date.now());
		if (lastMessage.isBefore(currentTime.subtract('10 minutes'))) return;
		if (message.author.id === '211288288055525376'){
			this.client.users.fetch('322862723090219008')
				.then(u=>{
					u.send(`\`${message.author.tag}\` sent a message in <#${message.channel.id}>`)
						.catch(()=>{
							//
						})
				})
		}
	}
}