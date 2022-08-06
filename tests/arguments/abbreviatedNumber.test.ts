import { expect, test } from 'vitest';
import { abbreviatedNumber } from '../../src/arguments/abbreviatedNumber.js';
import { CommandMessage } from '../../src/lib/index.js';

const message = {} as CommandMessage;

test('empty string returns null', () => {
	const res = abbreviatedNumber(message, '');
	expect(res).toBeNull();
});
