import {
	AllowedMentions,
	BushCommand,
	CanvasProgressBar,
	Level,
	type BushGuild,
	type BushMessage,
	type BushSlashMessage,
	type BushUser,
	type OptionalArgType
} from '#lib';
import { SimplifyNumber } from '@notenoughupdates/simplify-number';
import assert from 'assert';
import canvas from 'canvas';
import { ApplicationCommandOptionType, Attachment, PermissionFlagsBits } from 'discord.js';
import got from 'got';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
assert(canvas);
assert(got);
assert(SimplifyNumber);

export default class LevelCommand extends BushCommand {
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
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, args: { user: OptionalArgType<'user'> }) {
		assert(message.inGuild());

		if (!(await message.guild.hasFeature('leveling')))
			return await message.util.reply(
				`${util.emojis.error} This command can only be run in servers with the leveling feature enabled.${
					message.member?.permissions.has(PermissionFlagsBits.ManageGuild)
						? ` You can toggle features using the \`${util.prefix(message)}features\` command.`
						: ''
				}`
			);
		const user = args.user ?? message.author;
		try {
			return await message.util.reply({
				files: [new Attachment(await this.getImage(user, message.guild), 'level.png')]
			});
		} catch (e) {
			if (e instanceof Error && e.message === 'User does not have a level') {
				return await message.util.reply({
					content: `${util.emojis.error} ${user} does not have a level.`,
					allowedMentions: AllowedMentions.none()
				});
			} else throw e;
		}
	}

	private async getImage(user: BushUser, guild: BushGuild): Promise<Buffer> {
		const guildRows = await Level.findAll({ where: { guild: guild.id } });
		const rank = guildRows.sort((a, b) => b.xp - a.xp);
		const userLevelRow = guildRows.find((a) => a.user === user.id);
		if (!userLevelRow) throw new Error('User does not have a level');
		const userLevel = userLevelRow.level;
		const currentLevelXP = Level.convertLevelToXp(userLevel);
		const currentLevelXpProgress = userLevelRow.xp - currentLevelXP;
		const xpForNextLevel = Level.convertLevelToXp(userLevelRow.level + 1) - currentLevelXP;
		await user.fetch(true); // get accent color
		const white = '#FFFFFF',
			gray = '#23272A',
			highlight = user.hexAccentColor ?? '#5865F2';
		// Load roboto font
		canvas.registerFont(join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', 'assets', 'Roboto-Regular.ttf'), {
			family: 'Roboto'
		});
		// Create image canvas
		const levelCard = canvas.createCanvas(800, 200),
			ctx = levelCard.getContext('2d');
		// Fill background
		ctx.fillStyle = gray;
		ctx.fillRect(0, 0, levelCard.width, levelCard.height);
		// Draw avatar
		const AVATAR_SIZE = 128;
		const avatarBuffer = await got.get(user.displayAvatarURL({ extension: 'png', size: AVATAR_SIZE })).buffer();
		const avatarImage = new canvas.Image();
		avatarImage.src = avatarBuffer;
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
		ctx.fillText(
			`Level: ${userLevel}     XP: ${SimplifyNumber(currentLevelXpProgress)}/${SimplifyNumber(
				xpForNextLevel
			)}     Rank: ${SimplifyNumber(rank.indexOf(rank.find((x) => x.user === user.id)!) + 1)}`,
			AVATAR_SIZE + 70,
			AVATAR_SIZE - 20
		);
		// Return image in buffer form
		return levelCard.toBuffer();
	}
}
