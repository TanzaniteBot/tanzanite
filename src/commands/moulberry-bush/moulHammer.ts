import { MessageEmbed, User } from 'discord.js';
import { BushCommand, BushMessage } from '../../lib';

export default class MoulHammerCommand extends BushCommand {
	public constructor() {
		super('moulHammer', {
			aliases: ['moulhammer'],
			category: "Moulberry's Bush",
			description: {
				content: 'A command to moul hammer members.',
				usage: 'moulHammer <user>',
				examples: ['moulHammer @IRONM00N']
			},
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES'],
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to moul hammer?',
						retry: '{error} Choose a valid user to moul hammer'
					}
				}
			],
			restrictedGuilds: ['516977525906341928']
		});
	}

	public override async exec(message: BushMessage, { user }: { user: User }): Promise<void> {
		await message.delete();
		const embed = new MessageEmbed()
			.setTitle('L')
			.setDescription(`${user.username} got moul'ed <:wideberry1:756223352598691942><:wideberry2:756223336832303154>`)
			.setColor(this.client.util.colors.purple);
		await message.util.send({ embeds: [embed] });
	}
}
