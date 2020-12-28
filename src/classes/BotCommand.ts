import { Command } from 'discord-akairo'
import BotClient from '../client/BotClient'

export class BotCommand extends Command {
	public client = <BotClient> super.client
}