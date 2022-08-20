import { CommandMessage } from '#lib';
import { expect, test } from 'vitest';
import { abbreviatedNumber } from '../../lib/arguments/abbreviatedNumber.js';

const message = {} as CommandMessage;

test('empty string returns null', () => {
	const res = abbreviatedNumber(message, '');
	expect(res).toBeNull();
});
