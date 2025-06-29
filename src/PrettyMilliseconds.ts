/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Ayios. All rights reserved.
 *  All code within this repository created by Ayios is under MIT license. Other code within
 *  this repository is under its own respective license which will be displayed within their
 *  respective files or around the areas of their code.
 *  See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * @author sindresorhus
 * @license MIT
 * @link https://github.com/sindresorhus/pretty-ms
 */
// @ts-nocheck
function parseMilliseconds(milliseconds: number) {
    if (typeof milliseconds !== 'number') {
        throw new TypeError('Expected a number');
    }
    
    return {
		days: Math.trunc(milliseconds / 86400000),
		hours: Math.trunc(milliseconds / 3600000) % 24,
		minutes: Math.trunc(milliseconds / 60000) % 60,
		seconds: Math.trunc(milliseconds / 1000) % 60,
		milliseconds: Math.trunc(milliseconds) % 1000,
		microseconds: Math.trunc(milliseconds * 1000) % 1000,
		nanoseconds: Math.trunc(milliseconds * 1e6) % 1000
	}
}

export interface Options {
	/**
	Number of digits to appear after the seconds decimal point.

	@default 1
	*/
	readonly secondsDecimalDigits?: number;

	/**
	Number of digits to appear after the milliseconds decimal point.

	Useful in combination with [`process.hrtime()`](https://nodejs.org/api/process.html#process_process_hrtime).

	@default 0
	*/
	readonly millisecondsDecimalDigits?: number;

	/**
	Keep milliseconds on whole seconds: `13s` → `13.0s`.

	Useful when you are showing a number of seconds spent on an operation and don't want the width of the output to change when hitting a whole number.

	@default false
	*/
	readonly keepDecimalsOnWholeSeconds?: boolean;

	/**
	Only show the first unit: `1h 10m` → `1h`.

	Also ensures that `millisecondsDecimalDigits` and `secondsDecimalDigits` are both set to `0`.

	@default false
	*/
	readonly compact?: boolean;

	/**
	 * Ignore small  (ms, nano, etc)
	 * 
	 * @default false
	 */
	readonly ignoreSmall?: boolean;
	/**
	Number of units to show. Setting `compact` to `true` overrides this option.

	@default Infinity
	*/
	readonly unitCount?: number;

	/**
	Use full-length units: `5h 1m 45s` → `5 hours 1 minute 45 seconds`.

	@default false
	*/
	readonly verbose?: boolean;

	/**
	Show milliseconds separately. This means they won't be included in the decimal part of the seconds.

	@default false
	*/
	readonly separateMilliseconds?: boolean;

	/**
	Show microseconds and nanoseconds.

	@default false
	*/
	readonly formatSubMilliseconds?: boolean;

	/**
	Display time using colon notation: `5h 1m 45s` → `5:01:45`. Always shows time in at least minutes: `1s` → `0:01`

	Useful when you want to display time without the time units, similar to a digital watch.

	Setting `colonNotation` to `true` overrides the following options to `false`:
	- `compact`
	- `formatSubMilliseconds`
	- `separateMilliseconds`
	- `verbose`

	@default false
	*/
	readonly colonNotation?: boolean;
}

/**
Convert milliseconds to a human readable string: `1337000000` → `15d 11h 23m 20s`.

@param milliseconds - Milliseconds to humanize.

@example
```
import prettyMilliseconds from 'pretty-ms';

prettyMilliseconds(1337000000);
//=> '15d 11h 23m 20s'

prettyMilliseconds(1337);
//=> '1.3s'

prettyMilliseconds(133);
//=> '133ms'

// `compact` option
prettyMilliseconds(1337, {compact: true});
//=> '1s'

// `verbose` option
prettyMilliseconds(1335669000, {verbose: true});
//=> '15 days 11 hours 1 minute 9 seconds'

// `colonNotation` option
prettyMilliseconds(95500, {colonNotation: true});
//=> '1:35.5'

// `formatSubMilliseconds` option
prettyMilliseconds(100.400080, {formatSubMilliseconds: true})
//=> '100ms 400µs 80ns'

// Can be useful for time durations
prettyMilliseconds(new Date(2014, 0, 1, 10, 40) - new Date(2014, 0, 1, 10, 5))
//=> '35m'
```
*/
const pluralize = (word, count) => count === 1 ? word : `${word}s`;

const SECOND_ROUNDING_EPSILON = 0.000_000_1;

export default (milliseconds, options: Options = {}): string => {
	if (!Number.isFinite(milliseconds)) {
		throw new TypeError('Expected a finite number');
	}

	if (options.colonNotation) {
		options.compact = false;
		options.formatSubMilliseconds = false;
		options.separateMilliseconds = false;
		options.verbose = false;
	}

	if (options.compact) {
		options.secondsDecimalDigits = 0;
		options.millisecondsDecimalDigits = 0;
	}

	const result = [];

	const floorDecimals = (value, decimalDigits) => {
		const flooredInterimValue = Math.floor((value * (10 ** decimalDigits)) + SECOND_ROUNDING_EPSILON);
		const flooredValue = Math.round(flooredInterimValue) / (10 ** decimalDigits);
		return flooredValue.toFixed(decimalDigits);
	};

	const add = (value, long, short, valueString) => {
		if ((result.length === 0 || !options.colonNotation) && value === 0 && !(options.colonNotation && short === 'm')) {
			return;
		}

		valueString = (valueString || value || '0').toString();
		let prefix;
		let suffix;
		if (options.colonNotation) {
			prefix = result.length > 0 ? ':' : '';
			suffix = '';
			const wholeDigits = valueString.includes('.') ? valueString.split('.')[0].length : valueString.length;
			const minLength = result.length > 0 ? 2 : 1;
			valueString = '0'.repeat(Math.max(0, minLength - wholeDigits)) + valueString;
		} else {
			prefix = '';
			suffix = options.verbose ? ' ' + pluralize(long, value) : short;
		}

		result.push(prefix + valueString + suffix);
	};

	const parsed = parseMilliseconds(milliseconds);

	add(Math.trunc(parsed.days / 365), 'year', 'y');
	add(parsed.days % 365, 'day', 'd');
	add(parsed.hours, 'hour', 'h');
	add(parsed.minutes, 'minute', 'm');

	if (
		options.separateMilliseconds
		|| options.formatSubMilliseconds
		|| (!options.colonNotation && milliseconds < 1000)
	) {
		add(parsed.seconds, 'second', 's');
		if (options.formatSubMilliseconds) {
			if (!options.ignoreSmall) {
				add(parsed.milliseconds, 'millisecond', 'ms');
				add(parsed.microseconds, 'microsecond', 'µs');
				add(parsed.nanoseconds, 'nanosecond', 'ns');
			}
		} else {
			if (!options.ignoreSmall) {
				const millisecondsAndBelow
					= parsed.milliseconds
					+ (parsed.microseconds / 1000)
					+ (parsed.nanoseconds / 1e6);
	
				const millisecondsDecimalDigits
					= typeof options.millisecondsDecimalDigits === 'number'
						? options.millisecondsDecimalDigits
						: 0;
	
				const roundedMiliseconds = millisecondsAndBelow >= 1
					? Math.round(millisecondsAndBelow)
					: Math.ceil(millisecondsAndBelow);
	
				const millisecondsString = millisecondsDecimalDigits
					? millisecondsAndBelow.toFixed(millisecondsDecimalDigits)
					: roundedMiliseconds;
	
				add(
					Number.parseFloat(millisecondsString),
					'millisecond',
					'ms',
					millisecondsString,
				);
			}
		}
	} else {
		const seconds = (milliseconds / 1000) % 60;
		const secondsDecimalDigits
			= typeof options.secondsDecimalDigits === 'number'
				? options.secondsDecimalDigits
				: 1;
		const secondsFixed = floorDecimals(seconds, secondsDecimalDigits);
		const secondsString = options.keepDecimalsOnWholeSeconds
			? secondsFixed
			: secondsFixed.replace(/\.0+$/, '');
		add(Number.parseFloat(secondsString), 'second', 's', secondsString);
	}

	if (result.length === 0) {
		return '0' + (options.verbose ? ' milliseconds' : 'ms');
	}

	if (options.compact) {
		return result[0];
	}

	if (typeof options.unitCount === 'number') {
		const separator = options.colonNotation ? '' : ' ';
		return result.slice(0, Math.max(options.unitCount, 1)).join(separator);
	}

	return options.colonNotation ? result.join('') : result.join(' ');
}