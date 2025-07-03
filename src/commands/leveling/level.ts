import {
	AllowedMentions,
	BotCommand,
	CanvasProgressBar,
	Level,
	Time,
	emojis,
	sleep,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import { stripIndent } from '#lib/common/tags.js';
import { codeBlock } from '#lib/utils/Format.js';
import canvas from '@napi-rs/canvas';
import { simplifyNumber } from '@tanzanite/simplify-number';
import { ApplicationCommandOptionType, AttachmentBuilder, Guild, PermissionFlagsBits, User } from 'discord.js';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

assert(canvas != null);

export default class LevelCommand extends BotCommand {
	public constructor() {
		super('level', {
			aliases: ['level', 'rank', 'lvl'],
			category: 'leveling',
			description: 'Shows the level of a user',
			usage: ['level [user]'],
			examples: ['level', 'level @Tyman'],
			args: [
				{
					id: 'user',
					description: 'The user to get the level of.',
					type: 'user',
					prompt: 'What user would you like to see the level of?',
					retry: '{error} Choose a valid user to see the level of.',
					optional: true,
					slashType: ApplicationCommandOptionType.User
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: ['AttachFiles'],
			clientCheckChannel: true,
			userPermissions: []
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { user: OptArgType<'user'> }) {
		performance.mark(`level:${message.id}:start`);
		assert(message.inGuild());

		// everything needs to be optimized, this is temporary because its too slow
		if (message.util.isSlashMessage(message)) {
			await message.interaction.deferReply();
		}

		performance.mark(`level:${message.id}:defer`);

		if (!(await message.guild.hasFeature('leveling')))
			return await message.util.reply(
				`${emojis.error} This command can only be run in servers with the leveling feature enabled.${
					message.member?.permissions.has(PermissionFlagsBits.ManageGuild)
						? ` You can toggle features using the \`${this.client.utils.prefix(message)}features\` command.`
						: ''
				}`
			);

		performance.mark(`level:${message.id}:feature`);

		const user = args.user ?? message.author;
		try {
			performance.mark(`level:${message.id}:preimg`);

			const img = await this.getImage(user, message.guild, `level:${message.id}`);

			performance.mark(`level:${message.id}:postimg`);

			const time = (start: string, end: string): string => {
				const measure = performance.measure(
					`level:${message.id}:${start}${end}`,
					`level:${message.id}:${start}`,
					`level:${message.id}:${end}`
				);

				return `${measure.duration.toLocaleString('en-US')} ms`;
			};

			const content = this.client.isOwner(message.author)
				? codeBlock(stripIndent`
					start->preimg:\t${time('start', 'preimg')}
						start->defer\t${time('start', 'defer')}
						defer->feature\t${time('defer', 'feature')}
					start->postimg:\t${time('start', 'postimg')}
					preimg->postimg\t${time('preimg', 'postimg')}
						image:start->image:rows\t${time('image:start', 'image:rows')}
						image:rows->image:sort\t${time('image:rows', 'image:sort')}
						image:sort->image:find\t${time('image:sort', 'image:find')}
						image:find->image:convert\t${time('image:find', 'image:convert')}
						image:convert->image:fetch\t${time('image:convert', 'image:fetch')}
						image:fetch->image:draw\t${time('image:fetch', 'image:draw')}
						image:draw->image:buffer\t${time('image:draw', 'image:buffer')}
					`)
				: '';

			performance.clearMarks();
			performance.clearMeasures();

			return await message.util.reply({
				content,
				files: [new AttachmentBuilder(img, { name: 'level.png' })]
			});
		} catch (e) {
			if (e instanceof Error && e.message === 'User does not have a level') {
				return await message.util.reply({
					content: `${emojis.error} ${user} does not have a level.`,
					allowedMentions: AllowedMentions.none()
				});
			} else throw e;
		}
	}

	private async getImage(user: User, guild: Guild, pref: string): Promise<Buffer> {
		const mark = (name: string) => {
			this.logger.debug(`mark: ${name}`);
			performance.mark(`${pref}:${name}`);
		};

		mark(`image:start`);

		const guildRows = await Level.findAll({ where: { guild: guild.id } });

		mark(`image:rows`);

		this.logger.debug(`guildRows: ${guildRows.length}`);

		const rank = guildRows.sort((a, b) => b.xp - a.xp);

		mark(`image:sort`);

		const userLevelRow = guildRows.find((a) => a.user === user.id);

		mark(`image:find`);

		if (!userLevelRow) throw new Error('User does not have a level');
		const userLevel = userLevelRow.level;
		const currentLevelXP = Level.convertLevelToXp(userLevel);
		const currentLevelXpProgress = userLevelRow.xp - currentLevelXP;
		const xpForNextLevel = Level.convertLevelToXp(userLevelRow.level + 1) - currentLevelXP;

		mark(`image:convert`);

		this.logger.debug(`hexAccentColor: ${user.hexAccentColor}`);

		await Promise.race([
			user.fetch(true), // get accent color
			sleep(2 * Time.Second) // timeout request after 2 seconds
		]);

		mark(`image:fetch`);

		const white = '#FFFFFF',
			gray = '#23272A',
			highlight = user.hexAccentColor ?? '#5865F2';

		// Create image canvas
		const levelCard = canvas.createCanvas(800, 200),
			ctx = levelCard.getContext('2d');
		// Fill background
		ctx.fillStyle = gray;
		ctx.fillRect(0, 0, levelCard.width, levelCard.height);
		// Draw avatar
		const AVATAR_SIZE = 128;
		const avatarImage = new canvas.Image();
		avatarImage.src = Buffer.from(
			await (await fetch(user.displayAvatarURL({ extension: 'png', size: AVATAR_SIZE }))).arrayBuffer()
		);

		const imageTopCoord = levelCard.height / 2 - AVATAR_SIZE / 2;
		ctx.drawImage(avatarImage, imageTopCoord, imageTopCoord, AVATAR_SIZE, AVATAR_SIZE);
		// Write tag of user
		ctx.font = '30px Roboto';
		ctx.fillStyle = white;
		const measuredTag = ctx.measureText(user.tag);
		ctx.fillText(user.tag, AVATAR_SIZE + 70, 60);
		// Draw line under tag
		ctx.fillStyle = highlight;
		ctx.fillRect(AVATAR_SIZE + 70, 65 + measuredTag.actualBoundingBoxDescent, measuredTag.width, 3);
		// Draw leveling bar
		const progressParams = {
			x: AVATAR_SIZE + 70,
			y: AVATAR_SIZE - 0,
			height: 30,
			width: 550
		};
		const fullProgressBar = new CanvasProgressBar(ctx, progressParams, white, 1);
		fullProgressBar.draw();
		const progressBar = new CanvasProgressBar(ctx, progressParams, highlight, currentLevelXpProgress / xpForNextLevel);
		progressBar.draw();
		// Draw level data text
		ctx.fillStyle = white;

		const xpTxt = `${simplifyNumber(currentLevelXpProgress)}/${simplifyNumber(xpForNextLevel)}`;

		const rankTxt = simplifyNumber(rank.indexOf(userLevelRow) + 1);

		ctx.fillText(`Level: ${userLevel}     XP: ${xpTxt}     Rank: ${rankTxt}`, AVATAR_SIZE + 70, AVATAR_SIZE - 20);

		mark(`image:draw`);

		// Return image in buffer form
		const buf = levelCard.toBuffer('image/png');

		mark(`image:buffer`);

		return buf;
	}
}
