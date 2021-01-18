import { BotCommand } from '../../extensions/BotCommand';
import { MessageEmbed, Message } from 'discord.js';
import {stripIndent} from 'common-tags'

// noinspection SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection,SpellCheckingInspection
export default class CommandsCommand extends BotCommand {
	public constructor() {
		super('commands', {
			aliases: ['commands', 'command'],
			category: 'tag',
			description: {
				content: 'All the NEU Commands',
				usage: 'commands',
			},
			ratelimit: 4,
			cooldown: 4000,
		});
	}

	public async exec(message: Message): Promise<void> {
		try {
			const embed = new MessageEmbed()
				.setDescription(
					stripIndent`
						\`/neureloadrepo\` - Debug command with repo
						\`/neuresetrepo\` - Deletes all repo files 
						\`/neudungeonwintest\` shows the dungeon win animation
						\`/neusettings,/neuconfig,/neu\` - Opens the settings you can also do 
						\`/neustats\` - Copys helpful info to the clipboard, /neustats modlist to show all your mods
						\`/neugamemodes\` - lets you set custom gamemodes on a new skyblock island 
						\`/neucl\` - Opens the collection log 
						\`/neulinks\` - Shows links for moulberry 
						\`/neumap\` - Opens map settings
						\`/neurename\` you can rename skyblock items with this 
						\`/neuoverlay\` - Edit the search bar and quick commands location 
						\`/neucosmetics\` - Lets you equip capes. others can see they if you support moul's patreon 
						\`/neututorial\` - Shows how to use the mod 
						\`/neucalendar\` - Opens the calendar
						\`/neuah\` - Opens the custom ah 
						\`/neuec\` - Opens the enchant colour menu
						\`/neuprofile,/pv,/vp\` - Opens the profile viewer
						\`/peek\` - Shows stats of a player in chat`
				)
				.setFooter(`Requested by: ${message.author.tag}`, message.author.avatarURL());
			await message.util.send(embed);
		} catch (e) {
			await message.util.send('Error occured when sending:\n' + (await this.client.consts.haste(e.stack)));
		}
	}
}
