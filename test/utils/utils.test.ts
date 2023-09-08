/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Time } from '#lib/utils/Constants.js';
import { hexToRgb, overflowEmbed, parseDuration } from '#lib/utils/Utils.js';
import { EmbedBuilder } from 'discord.js';

describe('parseDuration', () => {
	it('should have a null duration when given empty content', () => {
		const emptyStr = parseDuration('');
		assert.equal(emptyStr.duration, null);

		const noContent = parseDuration(' ');
		assert.equal(noContent.duration, null);
	});

	it('should have a null content when given empty content', () => {
		const emptyStr = parseDuration('');
		assert.equal(emptyStr.content, null);

		const noContent = parseDuration(' ');
		assert.equal(noContent.content, ' ');
	});

	it('should parse milliseconds correctly', () => {
		assert.equal(parseDuration('1milliseconds').duration, Time.Millisecond);
		assert.equal(parseDuration('1 milliseconds').duration, Time.Millisecond);
		assert.equal(parseDuration('1millisecond').duration, Time.Millisecond);
		assert.equal(parseDuration('1 millisecond').duration, Time.Millisecond);
		assert.equal(parseDuration('1msecs').duration, Time.Millisecond);
		assert.equal(parseDuration('1 msecs').duration, Time.Millisecond);
		assert.equal(parseDuration('1msec').duration, Time.Millisecond);
		assert.equal(parseDuration('1 msec').duration, Time.Millisecond);
		assert.equal(parseDuration('1ms').duration, Time.Millisecond);
		assert.equal(parseDuration('1 ms').duration, Time.Millisecond);
	});

	it('should parse seconds correctly', () => {
		assert.equal(parseDuration('1seconds').duration, Time.Second);
		assert.equal(parseDuration('1 seconds').duration, Time.Second);
		assert.equal(parseDuration('1second').duration, Time.Second);
		assert.equal(parseDuration('1 second').duration, Time.Second);
		assert.equal(parseDuration('1secs').duration, Time.Second);
		assert.equal(parseDuration('1 secs').duration, Time.Second);
		assert.equal(parseDuration('1sec').duration, Time.Second);
		assert.equal(parseDuration('1 sec').duration, Time.Second);
		assert.equal(parseDuration('1s').duration, Time.Second);
		assert.equal(parseDuration('1 s').duration, Time.Second);
	});

	it('should parse minutes correctly', () => {
		assert.equal(parseDuration('1minutes').duration, Time.Minute);
		assert.equal(parseDuration('1 minutes').duration, Time.Minute);
		assert.equal(parseDuration('1minute').duration, Time.Minute);
		assert.equal(parseDuration('1 minute').duration, Time.Minute);
		assert.equal(parseDuration('1mins').duration, Time.Minute);
		assert.equal(parseDuration('1 mins').duration, Time.Minute);
		assert.equal(parseDuration('1min').duration, Time.Minute);
		assert.equal(parseDuration('1 min').duration, Time.Minute);
		assert.equal(parseDuration('1m').duration, Time.Minute);
		assert.equal(parseDuration('1 m').duration, Time.Minute);
	});

	it('should parse hours correctly', () => {
		assert.equal(parseDuration('1hours').duration, Time.Hour);
		assert.equal(parseDuration('1 hours').duration, Time.Hour);
		assert.equal(parseDuration('1hour').duration, Time.Hour);
		assert.equal(parseDuration('1 hour').duration, Time.Hour);
		assert.equal(parseDuration('1hrs').duration, Time.Hour);
		assert.equal(parseDuration('1 hrs').duration, Time.Hour);
		assert.equal(parseDuration('1hr').duration, Time.Hour);
		assert.equal(parseDuration('1 hr').duration, Time.Hour);
		assert.equal(parseDuration('1h').duration, Time.Hour);
		assert.equal(parseDuration('1 h').duration, Time.Hour);
	});
});

describe('hexToRgb', () => {
	it('should convert hex to rgb', () => {
		assert.equal(hexToRgb('FF0000'), '255, 0, 0');
		assert.equal(hexToRgb('00FF00'), '0, 255, 0');
		assert.equal(hexToRgb('0000FF'), '0, 0, 255');
		assert.equal(hexToRgb('FFFFFF'), '255, 255, 255');
		assert.equal(hexToRgb('000000'), '0, 0, 0');
	});

	it('should correctly handle #', () => {
		assert.equal(hexToRgb('#FFFFFF'), '255, 255, 255');
	});
});

describe('overflowEmbed', () => {
	const timestamp = new Date().toISOString();
	const embedOptions = () => ({
		title: 'Embed Title',
		footer: {
			text: 'Footer Text',
			iconURL: 'https://example.com/footer.png'
		},
		author: {
			name: 'Author Name',
			iconURL: 'https://example.com/author.png',
			url: 'https://example.com/author'
		},
		color: 0xff0000,
		url: 'https://example.com/',
		timestamp,
		fields: [
			{
				name: 'Field 1 Title',
				value: 'Field 1 Value',
				inline: true
			}
		],
		thumbnail: {
			url: 'https://example.com/thumbnail.png'
		},
		image: {
			url: 'https://example.com/image.png'
		}
	});

	it('should handle no lines', () => {
		assert.deepEqual(overflowEmbed({}, []), [new EmbedBuilder()]);
		assert.deepEqual(overflowEmbed(embedOptions(), []), [new EmbedBuilder(embedOptions())]);
	});

	it("should correctly assign properties when there is only one embed's worth of lines", () => {
		assert.deepEqual(overflowEmbed({}, ['line1', 'line2']), [new EmbedBuilder({ description: 'line1\nline2' })]);

		assert.deepEqual(overflowEmbed(embedOptions(), ['line1', 'line2']), [
			new EmbedBuilder({ description: 'line1\nline2', ...embedOptions() })
		]);
	});

	it("should correctly assign properties when there is more than one embed's worth of lines", () => {
		assert.deepEqual(overflowEmbed({}, ['.'.repeat(4096), 'line2']), [
			new EmbedBuilder({ description: '.'.repeat(4096) }),
			new EmbedBuilder({ description: 'line2' })
		]);

		assert.deepEqual(overflowEmbed({}, ['a'.repeat(2048), 'b'.repeat(2047 /* account for \n */), 'c']), [
			new EmbedBuilder({ description: `${'a'.repeat(2048)}\n${'b'.repeat(2047)}` }),
			new EmbedBuilder({ description: 'c' })
		]);

		assert.deepEqual(overflowEmbed(embedOptions(), ['.'.repeat(4096), 'line 2!']), [
			new EmbedBuilder({
				description: '.'.repeat(4096),
				title: embedOptions().title,
				author: embedOptions().author,
				color: embedOptions().color,
				url: embedOptions().url
			}),
			new EmbedBuilder({
				description: 'line 2!',
				color: embedOptions().color,
				footer: embedOptions().footer,
				timestamp: embedOptions().timestamp,
				fields: embedOptions().fields,
				thumbnail: embedOptions().thumbnail,
				image: embedOptions().image
			})
		]);

		assert.deepEqual(overflowEmbed(embedOptions(), ['1'.repeat(4096), '2'.repeat(4096), 'line 3!']), [
			new EmbedBuilder({
				description: '1'.repeat(4096),
				title: embedOptions().title,
				author: embedOptions().author,
				color: embedOptions().color,
				url: embedOptions().url
			}),
			new EmbedBuilder({
				description: '2'.repeat(4096),
				color: embedOptions().color
			}),
			new EmbedBuilder({
				description: 'line 3!',
				color: embedOptions().color,
				footer: embedOptions().footer,
				timestamp: embedOptions().timestamp,
				fields: embedOptions().fields,
				thumbnail: embedOptions().thumbnail,
				image: embedOptions().image
			})
		]);
	});
});
