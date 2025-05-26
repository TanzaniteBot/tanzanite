/* eslint-disable */
import { BotListener, Emitter, isInDebugMode, type BotClientEvents } from '#lib';
import { AkairoClientEvent } from '@tanzanite/discord-akairo/dist/src/util/Constants.js';
import { detailedDiff } from 'deep-object-diff';
import assert from 'node:assert';

export default class DiscordJsDebugListener extends BotListener {
	public constructor() {
		super('akairoDebug', {
			emitter: Emitter.Client,
			event: AkairoClientEvent.AKAIRO_DEBUG
		});
	}

	public exec(...[message, ...other]: BotClientEvents['debug']): void {
		if (message.includes('[registerInteractionCommandsCompare]')) {
			if (!isInDebugMode()) return;

			const [calculated, current] = other as unknown as [any, any];

			this.client.console.superVerboseRaw('akairoDebug', { current, calculated });

			const replacer = (key: string, value: any) => {
				if (typeof value === 'bigint') return value.toString();
				if (Array.isArray(value)) {
					return value.toSorted((a, b) => {
						if (typeof a === 'number' && typeof b === 'number') {
							return a > b ? 1 : a < b ? -1 : 0;
						} else return a.toString().localeCompare(b.toString());
					});
				}
				return value;
			};

			const a = JSON.parse(JSON.stringify(current, replacer));
			const b = JSON.parse(JSON.stringify(calculated, replacer));

			this.client.console.superVerboseRaw('akairoDebug', { current: a, calculated: b });

			this.client.console.superVerboseRaw('akairoDebug', detailedDiff(a, b));

			try {
				assert.deepStrictEqual(a, b);
			} catch (error) {
				this.client.console.superVerbose('akairoDebug', error);
			}
		} else if (other.length && !message.includes('[registerInteractionCommands]'))
			void this.client.console.superVerboseRaw('akairoDebug', message, ...other);
		else void this.client.console.superVerbose('akairoDebug', message);
	}
}
