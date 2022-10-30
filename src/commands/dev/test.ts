import { BotCommand, ButtonPaginator, chunk, colors, emojis, OptArgType, Shared, type CommandMessage } from '#lib';
import badLinksSecretArray from '#lib/badlinks-secret.js';
import badLinksArray from '#lib/badlinks.js';
import badWords from '#lib/badwords.js';
import {
	ActionRowBuilder,
	APIEmbed,
	ButtonBuilder,
	ButtonStyle,
	Collection,
	EmbedBuilder,
	Message,
	Routes,
	type ApplicationCommand
} from 'discord.js';

export default class TestCommand extends BotCommand {
	public constructor() {
		super('test', {
			aliases: ['test'],
			category: 'dev',
			description: 'A command to test stuff.',
			usage: ['test [feature]'],
			examples: ['test lots of buttons', 'test buttons'],
			args: [
				{
					id: 'feature',
					description: 'The feature to test.',
					match: 'rest',
					prompt: 'start prompt',
					retry: 'retry prompt',
					optional: true,
					slashType: false
				}
			],
			superUserOnly: true,
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: []
		});
	}

	public override async exec(message: CommandMessage, args: { feature: OptArgType<'string'> }) {
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

		console.dir(args);

		if (args.feature) {
			if (['button', 'buttons'].includes(args.feature?.toLowerCase())) {
				const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder({
						style: ButtonStyle.Primary,
						customId: 'test;button;primary',
						label: 'Primary'
					}),
					new ButtonBuilder({
						style: ButtonStyle.Secondary,
						customId: 'test;button;secondary',
						label: 'Secondary'
					}),
					new ButtonBuilder({
						style: ButtonStyle.Success,
						customId: 'test;button;success',
						label: 'Success'
					}),
					new ButtonBuilder({
						style: ButtonStyle.Danger,
						customId: 'test;button;danger',
						label: 'Danger'
					}),
					new ButtonBuilder({
						style: ButtonStyle.Link,
						label: 'Link',
						url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
					})
				);

				return await message.util.reply({ content: 'buttons', components: [buttonRow] });
			} else if (['embed', 'button embed'].includes(args.feature?.toLowerCase())) {
				const embed = new EmbedBuilder()
					.addFields({ name: 'Field Name', value: 'Field Content' })
					.setAuthor({ name: 'Author', iconURL: 'https://www.w3schools.com/w3css/img_snowtops.jpg', url: 'https://google.com/' })
					.setColor(message.member?.displayColor ?? colors.default)
					.setDescription('Description')
					.setFooter({ text: 'Footer', iconURL: message.author.avatarURL() ?? undefined })
					.setURL('https://duckduckgo.com/')
					.setTimestamp()
					.setImage('https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png')
					.setThumbnail(
						'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2134&q=80'
					)
					.setTitle('Title');

				const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder({ style: ButtonStyle.Link, label: 'Link', url: 'https://google.com/' })
				);

				return await message.util.reply({ content: 'Test', embeds: [embed], components: [buttonRow] });
			} else if (['lots of buttons'].includes(args.feature?.toLowerCase())) {
				const buttonRows: ActionRowBuilder<ButtonBuilder>[] = [];

				for (let a = 1; a <= 5; a++) {
					const row = new ActionRowBuilder<ButtonBuilder>();

					for (let b = 1; b <= 5; b++) {
						const id = `test;lots;${a + 5 * (b - 1)}`;
						const button = new ButtonBuilder({ style: ButtonStyle.Primary, customId: id, label: id });
						row.addComponents(button);
					}

					buttonRows.push(row);
				}

				return await message.util.reply({ content: 'buttons', components: buttonRows });
			} else if (['paginate'].includes(args.feature?.toLowerCase())) {
				const embeds = [];
				for (let i = 1; i <= 5; i++) {
					embeds.push(new EmbedBuilder().setDescription(i.toString()));
				}
				return await ButtonPaginator.send(message, embeds);
			} else if (['lots of embeds'].includes(args.feature?.toLowerCase())) {
				const description = 'This is a description.';
				const _avatar = message.author.avatarURL() ?? undefined;
				const author = { name: 'This is a author', iconURL: _avatar };
				const footer = { text: 'This is a footer', iconURL: _avatar };
				const fields = Array(25)
					.fill(0)
					.map((_, i) => ({ name: `Field ${i}`, value: 'Field Value' }));
				const o = { description, author, footer, fields, time: Date.now() };

				const c = colors;
				const embedColors = [c.red, c.orange, c.gold, c.yellow, c.green, c.darkGreen, c.aqua, c.blue, c.purple, c.pink];

				const embeds = embedColors.map((c, i) => ({ ...o, title: `Embed Title ${i}`, color: c }));

				const ButtonRows: ActionRowBuilder<ButtonBuilder>[] = [];
				for (let a = 1; a <= 5; a++) {
					const row = new ActionRowBuilder<ButtonBuilder>();
					for (let b = 1; b <= 5; b++) {
						const id = (a + 5 * (b - 1)).toString();
						const button = new ButtonBuilder({ style: ButtonStyle.Secondary, customId: id, label: id });
						row.addComponents(button);
					}
					ButtonRows.push(row);
				}
				return await message.util.reply({ content: 'this is content', components: ButtonRows, embeds });
			} else if (['delete slash commands'].includes(args.feature?.toLowerCase())) {
				if (!message.guild) return await message.util.reply(`${emojis.error} This test can only be run in a guild.`);
				await this.client.guilds.fetch();
				const promises: Promise<Collection<string, ApplicationCommand>>[] = [];
				this.client.guilds.cache.each((guild) => {
					promises.push(guild.commands.set([]));
				});
				await Promise.all(promises);

				await this.client.application!.commands.fetch();
				await this.client.application!.commands.set([]);

				return await message.util.reply(`${emojis.success} Removed guild commands and global commands.`);
			} else if (['drop down', 'drop downs', 'select menu', 'select menus'].includes(args.feature?.toLowerCase())) {
				return message.util.reply(`${emojis.error} no`);
			} else if (['sync automod'].includes(args.feature?.toLowerCase())) {
				const row = (await Shared.findByPk(0))!;

				row.badLinks = badLinksArray;
				row.badLinksSecret = badLinksSecretArray;
				row.badWords = badWords;

				await row.save();

				return await message.util.reply(`${emojis.success} Synced automod.`);
			} else if (['modal'].includes(args.feature?.toLowerCase())) {
				return await message.util.reply({
					content: 'Click for modal',
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder({ style: ButtonStyle.Primary, label: 'Modal', customId: 'test;modal' })
						)
					]
				});
			} else if (args.feature.includes('backlog experiments')) {
				this.client.logger.debug('backlog experiments');

				if (message.channelId !== '1019830755658055691') {
					return await message.util.reply(`${emojis.error} This only works in <#1019830755658055691>.`);
				}

				let messages = new Collection<string, Message>();
				let lastID: string | undefined;

				// eslint-disable-next-line no-constant-condition
				while (true) {
					const fetchedMessages = await message.channel.messages.fetch({
						limit: 100,
						...(lastID && { before: lastID })
					});

					if (fetchedMessages.size === 0) {
						break;
					}

					messages = messages.concat(fetchedMessages);
					lastID = fetchedMessages.lastKey();

					this.client.logger.debug(messages.size);
					this.client.logger.debug(lastID);
				}

				const embeds = messages
					.sort((a, b) => a.createdTimestamp - b.createdTimestamp)
					.filter((m) => m.embeds.length > 0 && (m.embeds[0].title?.includes('Guild Experiment') ?? false))
					.map(
						(m): APIEmbed => ({
							...m.embeds[0]!.toJSON(),
							timestamp: new Date(m.createdTimestamp).toISOString()
						})
					);

				const chunked = chunk(embeds, 10);

				let i = 0;
				for (const chunk of chunked) {
					this.client.logger.debug(i);
					this.client.logger.debug(chunk, 1);
					await this.client.rest.post(Routes.channelMessages('795356494261911553'), {
						body: { embeds: chunk }
					});
					i++;
				}

				return await message.util.reply(`${emojis.success} Done.`);
			}
		}
		return await message.util.reply(responses[Math.floor(Math.random() * responses.length)]);
	}
}
