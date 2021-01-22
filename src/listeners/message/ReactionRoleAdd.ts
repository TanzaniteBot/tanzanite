import { User } from 'discord.js';
import { GuildMember } from 'discord.js';
import { Message, TextChannel } from 'discord.js';
import AllowedMentions from '../../extensions/AllowedMentions';
import { BotListener } from '../../extensions/BotListener';

export default class ReactionRoleAddListener extends BotListener {
	public constructor() {
		super('ReactionRoleAddListener', {
			emitter: 'client',
			event: 'messageReactionAdd',
			category: 'client',
		});
	}

	public async exec(message: Message, member: GuildMember): Promise<void> {
		if (!message.guild) return;
		if (message.author.bot) return;
		if (message.id=='802174847210749982'&&message.channel.id=='802174237062070292') {
			try {
				member.roles.add('802173969821073440')
			}catch (e){
				console.log(e)
			}
		} else {
			return;
		}
	}
}
