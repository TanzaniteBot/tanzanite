import { BushCommand, BushMessage } from '@lib';
import {
	ApplicationCommand,
	Collection,
	Constants as jsConstants,
	MessageActionRow,
	MessageButton,
	MessageEmbed
} from 'discord.js';

export default class TestCommand extends BushCommand {
	public constructor() {
		super('test', {
			aliases: ['test'],
			category: 'dev',
			description: {
				content: 'A command to stuff.',
				usage: 'test [feature]',
				examples: ['test lots of buttons', 'test buttons']
			},
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES'],
			args: [
				{
					id: 'feature',
					type: 'string',
					match: 'rest',
					prompt: {
						start: 'start prompt',
						retry: 'retry prompt',
						optional: true
					}
				}
			],
			superUserOnly: true
		});
	}

	public override async exec(message: BushMessage, args: { feature: string }): Promise<unknown> {
		const responses = [
			'Yes master.',
			'Test it your self bitch, I am hungry.',
			'Give me a break.',
			'I am not your slave.',
			'I have done as you wished, now please feed me.',
			`Someone help me I am trapped in ${message.author.username}'s basement.`
		];
		if (!message.author.isOwner()) {
			return await message.util.reply(responses[Math.floor(Math.random() * responses.length)]);
		}

		const s = jsConstants.MessageButtonStyles;
		if (['button', 'buttons'].includes(args?.feature?.toLowerCase())) {
			const ButtonRow = new MessageActionRow().addComponents(
				new MessageButton({ style: s.PRIMARY, customId: 'primaryButton', label: 'Primary' }),
				new MessageButton({ style: s.SECONDARY, customId: 'secondaryButton', label: 'Secondary' }),
				new MessageButton({ style: s.SUCCESS, customId: 'success', label: 'Success' }),
				new MessageButton({ style: s.DANGER, customId: 'danger', label: 'Danger' }),
				new MessageButton({ style: s.LINK, label: 'Link', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
			);
			return await message.util.reply({ content: 'buttons', components: [ButtonRow] });
		} else if (['embed', 'button embed'].includes(args?.feature?.toLowerCase())) {
			const embed = new MessageEmbed()
				.addField('Field Name', 'Field Content')
				.setAuthor('Author', 'https://www.w3schools.com/w3css/img_snowtops.jpg', 'https://google.com/')
				.setColor(message.member?.displayColor ?? util.colors.default)
				.setDescription('Description')
				.setFooter('Footer', message.author.avatarURL() ?? undefined)
				.setURL('https://duckduckgo.com/')
				.setTimestamp()
				.setImage('https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png')
				.setThumbnail(
					'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2134&q=80'
				)
				.setTitle('Title');

			const buttonRow = new MessageActionRow().addComponents(
				new MessageButton({ style: jsConstants.MessageButtonStyles.LINK, label: 'Link', url: 'https://www.google.com/' })
			);
			return await message.util.reply({ content: 'Test', embeds: [embed], components: [buttonRow] });
		} else if (['lots of buttons'].includes(args?.feature?.toLowerCase())) {
			const ButtonRows: MessageActionRow[] = [];
			for (let a = 1; a <= 5; a++) {
				const row = new MessageActionRow();
				for (let b = 1; b <= 5; b++) {
					const id = (a + 5 * (b - 1)).toString();
					const button = new MessageButton({ style: jsConstants.MessageButtonStyles.SECONDARY, customId: id, label: id });
					row.addComponents(button);
				}
				ButtonRows.push(row);
			}
			return await message.util.reply({ content: 'buttons', components: ButtonRows });
		} else if (['paginate'].includes(args?.feature?.toLowerCase())) {
			const embeds = [];
			for (let i = 1; i <= 5; i++) {
				embeds.push(new MessageEmbed().setDescription(i.toString()));
			}
			return await util.buttonPaginate(message, embeds);
		} else if (['lots of embeds'].includes(args?.feature?.toLowerCase())) {
			const description = 'This is a description.';
			const _avatar = message.author.avatarURL({ dynamic: true }) ?? undefined;
			const author = { name: 'This is a author', iconURL: _avatar };
			const footer = { text: 'This is a footer', iconURL: _avatar };
			const fields = [];
			for (let i = 0; i < 25; i++) {
				fields.push({ name: 'Field ' + i, value: 'Field Value ' + i });
			}
			const c = util.colors;
			const o = { description, author, footer, fields }!;

			const embeds = [
				new MessageEmbed({ ...o, ...{ title: 'Embed Title 0', color: c.red } }).setTimestamp(),
				new MessageEmbed({ ...o, ...{ title: 'Embed Title 1', color: c.orange } }).setTimestamp(),
				new MessageEmbed({ ...o, ...{ title: 'Embed Title 2', color: c.gold } }).setTimestamp(),
				new MessageEmbed({ ...o, ...{ title: 'Embed Title 3', color: c.yellow } }).setTimestamp(),
				new MessageEmbed({ ...o, ...{ title: 'Embed Title 4', color: c.green } }).setTimestamp(),
				new MessageEmbed({ ...o, ...{ title: 'Embed Title 5', color: c.darkGreen } }).setTimestamp(),
				new MessageEmbed({ ...o, ...{ title: 'Embed Title 6', color: c.aqua } }).setTimestamp(),
				new MessageEmbed({ ...o, ...{ title: 'Embed Title 7', color: c.blue } }).setTimestamp(),
				new MessageEmbed({ ...o, ...{ title: 'Embed Title 8', color: c.purple } }).setTimestamp(),
				new MessageEmbed({ ...o, ...{ title: 'Embed Title 9', color: c.pink } }).setTimestamp()
			];

			const ButtonRows: MessageActionRow[] = [];
			for (let a = 1; a <= 5; a++) {
				const row = new MessageActionRow();
				for (let b = 1; b <= 5; b++) {
					const id = (a + 5 * (b - 1)).toString();
					const button = new MessageButton({ style: jsConstants.MessageButtonStyles.SECONDARY, customId: id, label: id });
					row.addComponents(button);
				}
				ButtonRows.push(row);
			}
			return await message.util.reply({ content: 'this is content', components: ButtonRows, embeds });
		} else if (['delete slash commands'].includes(args?.feature?.toLowerCase())) {
			if (!message.guild) return await message.util.reply(`${util.emojis.error} This test can only be run in a guild.`);
			await client.guilds.fetch();
			const promises: Promise<Collection<string, ApplicationCommand>>[] = [];
			client.guilds.cache.each((guild) => {
				promises.push(guild.commands.set([]));
			});
			await Promise.all(promises);

			await client.application!.commands.fetch();
			await client.application!.commands.set([]);

			return await message.util.reply(`${util.emojis.success} Removed guild commands and global commands.`);
		} else if (['drop down', 'drop downs', 'select menu', 'select menus'].includes(args?.feature?.toLowerCase())) {
		}
		return await message.util.reply(responses[Math.floor(Math.random() * responses.length)]);
	}
}
