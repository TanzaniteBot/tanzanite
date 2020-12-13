import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { read, readFile } from 'fs';

export default class CatCommand extends Command {
	public constructor() {
		super('cat', {
			aliases: ['cat'],
			category: 'owner',
			description: {
				content: 'Gives the source of a file',
				usage: 'cat < filepath >'
			},
			args: [
				{
					id: 'file',
					match: 'content',
					type: "string",
					prompt: {
						start: 'What would you like to get the source of?'
					}
				}
			],
			ratelimit: 4,
			cooldown: 4000,
			ownerOnly: true,
		});
	};

	public async exec(message: Message, { file }: { file: string }) {
		if (this.client.commamdHandler.findCommand(file)) {
			readFile(this.client.commamdHandler.findCommand(file).filepath, async (err, data) => {
				// @ts-ignore
				this.client.consts.haste(data.toString()).then((url: string) => {
					message.util.send(url)
				})
			})
		} else {
			readFile(file, async (err, data) => {
				message.util.send(data.toString())
			})
		}
	};
};
