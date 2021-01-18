import { MessageEmbed, Collection, Message } from 'discord.js';
import { BotCommand } from '../../extensions/BotCommand';
import got from 'got';

// JSON-generated types so ts actually understands wtf is going on here
interface Class {
	name: string;
	description: string;
	extends?: ((string[] | null)[] | null)[] | null;
	props?: PropsEntity[] | null;
	methods?: MethodsEntity[] | null;
	meta: Meta;
}
interface PropsEntity {
	name: string;
	description: string;
	access?: string | null;
	type?: ((string[] | null)[] | null)[] | null;
	meta: Meta;
	readonly?: boolean | null;
}
interface Meta {
	line: number;
	file: string;
	path: string;
}
interface MethodsEntity {
	name: string;
	description: string;
	params?: ParamsEntity[] | null;
	returns?: ((string[] | null)[] | null)[] | null;
	meta: Meta;
	access?: string | null;
}
interface ParamsEntity {
	name: string;
	description: string;
	type?: ((string[] | null | string)[] | null)[] | null;
	variable?: boolean | null;
}

// Ok thats the end of those

const format = (txt: string): string => txt.replace(/<.+>/g, '```\n').replace(/<\/.+>/g, '```');

export default class SayCommand extends BotCommand {
	public constructor() {
		super('docs', {
			aliases: ['docs'],
			category: 'util',
			description: {
				content: 'A command to find things in the docs for discord.js, and discord-akairo soon™',
				usage: 'docs',
				examples: ['docs GuildMember'],
			},
			args: [
				{
					id: 'text',
					type: 'string',
					prompt: {
						start: 'What would you like to find',
					},
				},
			],
		});
	}
	public exec(message: Message, { text }: { text: string }): Message | void {
		got.get('https://raw.githubusercontent.com/discordjs/discord.js/docs/stable.json').then(async (response) => {
			const body = JSON.parse(response.body);
			const classes: Collection<string, Class> = new Collection();
			body.classes.forEach((e) => {
				classes.set(e.name, e);
			});
			const findClass = () => {
				return classes.find((e) => e.name.toLowerCase() == text) || null;
			};
			const c = findClass();
			if (c === null) {
				return message.util.send('Could not find that class!');
			} else {
				if (c.props === undefined || c.methods === undefined) {
					const embed = new MessageEmbed()
						.setTitle(c.name)
						.setDescription(`${format(c.description)}\n\n[Docs link](http://discord.js.org/#/docs/main/stable/class/${c.name})`)
						.setFooter(
							"For this class either there was not a single method or there wan not a single property. This caused me to exclude both, because if it didn't it would make the programmers' life much harder."
						)
						.setColor(this.client.consts.DefaultColor);
					return message.channel.send(embed);
				}
				let props = '';
				c.props.forEach((e) => {
					props = `${props}**${e.name}**: ${e.description}\n\n`;
				});
				let meths = '';
				c.methods.forEach((e) => {
					meths = `${meths}**${e.name}**: ${e.description}\n\n`;
				});
				const embed = new MessageEmbed()
					.setTitle(c.name)
					.setDescription(`${format(c.description)}\n\n[Docs link](http://discord.js.org/#/docs/main/stable/class/${c.name})`)
					.addField('| Properties', props, true)
					.addField('| Methods', meths, true)
					.setColor(this.client.consts.DefaultColor);
				return message.channel.send(embed).catch(() => {
					let propsSlim = '';
					c.props.forEach((e) => {
						propsSlim = `${propsSlim}${e.name}\n\n`;
					});
					let methsSlim = '';
					c.methods.forEach((e) => {
						methsSlim = `${methsSlim}${e.name}\n\n`;
					});
					const embedSlim = new MessageEmbed()
						.setTitle(c.name)
						.setDescription(`${format(c.description)}\n\n[Docs link](http://discord.js.org/#/docs/main/stable/class/${c.name})`)
						.addField('| Properties', props, true)
						.addField('| Methods', meths, true)
						.setFooter('This response was minified to get around the discord character limit')
						.setColor(this.client.consts.DefaultColor);
					message.channel.send(embedSlim).catch(() => {
						const embedSuperSlim = new MessageEmbed()
							.setTitle(c.name)
							.setDescription(`${format(c.description)}\n\n[Docs link](http://discord.js.org/#/docs/main/stable/class/${c.name})`)
							.setFooter('This response was super minified to get around the discord character limit')
							.setColor(this.client.consts.DefaultColor);
						message.channel.send(embedSuperSlim);
					});
				});
			}
		});
	}
}
