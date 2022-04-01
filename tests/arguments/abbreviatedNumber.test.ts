import { abbreviatedNumber } from '../../src/arguments/abbreviatedNumber.js';
import type { BushMessage } from '../../src/lib/index.js';

const fakeMessage = {} as BushMessage;

describe('abbreviatedNumber', () => {
	it('should return null when provided an empty string', () => {
		expect(abbreviatedNumber(fakeMessage, '')).toBe(null);
	});

	it('shoudl return null when provided a random string', () => {
		expect(abbreviatedNumber(fakeMessage, 'abc')).toBe(null);
	});
});
