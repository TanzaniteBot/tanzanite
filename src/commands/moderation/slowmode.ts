import { BotCommand                                     } from '../../extensions/BotCommand';
import { Message   , MessageEmbed, TextChannel, Channel } from 'discord.js'                 ;

export default class SlowModeCommand extends BotCommand {
	public constructor() {
		super('slowMode', {
			aliases: ['slowMode','slow'],
			category: 'moderation',
			description: {
				content: 'A command to set the slowmode of a channel.',
				usage: 'slowmode <length>',
				examples: ['slowmode 3'],
			},
			clientPermissions: ['MANAGE_CHANNELS'],
			userPermissions: ['MANAGE_MESSAGES','SEND_MESSAGES'],
			args: [
				{
					id: 'length',
					type: 'number',
					default: '0',
				},
				{
					id: 'selectedChannel',
					type: 'channel',
					prompt: {
						optional: true,
						start: 'What channel would you like to change the slowmode of?'
					}
				},
			],
			channel: 'guild',
		});
	}
	public async exec(message: Message, {length, selectedChannel}: {length: number, selectedChannel: Channel}): Promise<Message> {
		let newSelectedChannel;
		if (selectedChannel == null){
			newSelectedChannel = message.channel
		}else{
			newSelectedChannel = selectedChannel
		}
		if (length < 0 || length > 21600){
			const errorEmbed = new MessageEmbed();
			errorEmbed.setColor(this.client.consts.ErrorColor).setDescription(`\`${length}\` is not a valid length to set as the slowmode.`);
			return message.channel.send(errorEmbed);
		}
		
		if (message.channel.type == 'text'){
			newSelectedChannel.setRateLimitPerUser(length, `Changed by ${message.author.tag}.`)
			const successEmbed = new MessageEmbed()
			successEmbed.setColor(this.client.consts.SuccessColor).setDescription(`Successfully changed the slowmode of ${newSelectedChannel} to \`${length}\`.`);
			return message.channel.send(successEmbed)
		}
	}
}