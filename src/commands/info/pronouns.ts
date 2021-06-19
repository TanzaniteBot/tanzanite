import { CommandInteraction, Message, MessageEmbed, User } from 'discord.js';
import got, { HTTPError } from 'got';
import { SlashCommandOption } from '../../lib/extensions/BushClientUtil';
import { BushCommand } from '../../lib/extensions/BushCommand';
import { BushInteractionMessage } from '../../lib/extensions/BushInteractionMessage';

export const pronounMapping = {
	unspecified: 'Unspecified',
	hh: 'He/Him',
	hi: 'He/It',
	hs: 'He/She',
	ht: 'He/They',
	ih: 'It/Him',
	ii: 'It/Its',
	is: 'It/She',
	it: 'It/They',
	shh: 'She/He',
	sh: 'She/Her',
	si: 'She/It',
	st: 'She/They',
	th: 'They/He',
	ti: 'They/It',
	ts: 'They/She',
	tt: 'They/Them',
	any: 'Any pronouns',
	other: 'Other pronouns',
	ask: 'Ask me my pronouns',
	avoid: 'Avoid pronouns, use my name'
};
export type pronounsType = keyof typeof pronounMapping;

export default class PronounsCommand extends BushCommand {
	constructor() {
		super('pronouns', {
			aliases: ['pronouns', 'pronoun'],
			category: 'info',
			description: {
				usage: 'pronouns <user>',
				examples: ['pronouns IRONM00N'],
				content: 'Finds the pronouns of a user using https://pronoundb.org.'
			},
			args: [
				{
					id: 'user',
					type: 'user',
					default: null
				}
			],
			clientPermissions: ['SEND_MESSAGES'],
			slashOptions: [
				{
					type: 'USER',
					name: 'user',
					description: 'The user to get pronouns for',
					required: false
				}
			],
			slashEphemeral: true, // I'll add dynamic checking to this later
			slash: true
		});
	}
	async sendResponse(message: Message | CommandInteraction, user: User, author: boolean): Promise<void> {
		try {
			const apiRes: { pronouns: pronounsType } = await got
				.get(`https://pronoundb.org/api/v1/lookup?platform=discord&id=${user.id}`)
				.json();
			if (message instanceof Message) {
				message.reply({
					embeds: [
						new MessageEmbed({
							title: `${author ? 'Your' : `${user.tag}'s`} pronouns:`,
							description: pronounMapping[apiRes.pronouns],
							footer: {
								text: 'Data provided by https://pronoundb.org/'
							}
						})
					]
				});
			} else {
				message.reply({
					embeds: [
						new MessageEmbed({
							title: `${author ? 'Your' : `${user.tag}'s`} pronouns:`,
							description: pronounMapping[apiRes.pronouns],
							footer: {
								text: 'Data provided by https://pronoundb.org/'
							}
						})
					]
				});
			}
		} catch (e) {
			if (e instanceof HTTPError && e.response.statusCode === 404) {
				if (author) {
					await message.reply(
						'You do not appear to have any pronouns set. Please go to https://pronoundb.org/ and set your pronouns.'
					);
				} else {
					await message.reply(
						`${user.tag} does not appear to have any pronouns set. Please tell them to go to https://pronoundb.org/ and set their pronouns.`
					);
				}
			} else throw e;
		}
	}
	async exec(message: Message, { user }: { user?: User }): Promise<void> {
		const u = user || message.author;
		await this.sendResponse(message, u, u.id === message.author.id);
	}
	async execSlash(message: BushInteractionMessage, { user }: { user?: SlashCommandOption<void> }): Promise<void> {
		const u = user?.user || message.author;
		await this.sendResponse(message.interaction, u, u.id === message.author.id);
	}
}
