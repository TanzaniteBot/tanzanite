import { AkairoMessage } from '@tanzanite/discord-akairo';
import type { CacheType } from 'discord.js';

export class SlashMessage<Cached extends CacheType = CacheType> extends AkairoMessage<Cached> {}
