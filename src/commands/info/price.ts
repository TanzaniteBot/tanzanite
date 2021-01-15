import { Command } from 'discord-akairo';
import { TextChannel } from 'discord.js';
import { Message, MessageEmbed } from 'discord.js';
import got from 'got/dist/source';
import BotClient from '../../extensions/BotClient';

export default class PriceCommand extends Command {
	public constructor() {
		super('price', {
			aliases: ['price'],
			category: 'info',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				usage: 'price <item id>',
				examples: ['price ASPECT_OF_THE_END'],
				content: 'Finds the lowest bin of an item.',
			},
			ratelimit: 4,
			cooldown: 4000,
			args: [
				{
					id: 'item',
					match: 'content',
					type: 'string',
					prompt: {
						start: 'What item would you like to find the lowest BIN of?',
					},
				},
			],
		});
	}
	public async exec(message: Message, { item }: { item: Command }): Promise<Message> {
		const price = JSON.parse((await got.get('http://moulberry.codes/lowestbin.json')).body);
		const item1 = item.toString().toUpperCase();
		const itemstring = item1.replace(/ /g, '_');
		const client = <BotClient>this.client;
		let prettyPrice = 'error';
		try {
			if (price[itemstring]) {
				if (price.contains()) prettyPrice = price[itemstring].toLocaleString();
				else {
					prettyPrice = price;
				}
				const priceEmbed = new MessageEmbed();
				priceEmbed.setColor(client.consts.Green).setDescription(`The current lowest bin of \`${itemstring}\` is **${prettyPrice}**.`);
				return message.util.send(priceEmbed);
			} else {
				const errorEmbed = new MessageEmbed();
				errorEmbed.setColor(client.consts.ErrorColor).setDescription(`\`${itemstring}\` is not a valid item id.`);
				return message.util.send(errorEmbed);
			}
		} catch (e) {
			const generalLogChannel = <TextChannel>this.client.channels.cache.get(client.config.generalLogChannel);
			generalLogChannel.send(e);
		}
	}
}
