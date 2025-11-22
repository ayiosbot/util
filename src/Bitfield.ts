/*----------------------------------------------------------------------------------------------
 * The MIT License (MIT)
 *
 * Copyright (c) 2024 Discord
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * ---------------------------------------------------------------------------------------------
 * This file has been derived from:
 * https://github.com/discord/pronoun-bot/blob/main/src/discord/bitfield.ts
 *----------------------------------------------------------------------------------------------*/
/**
 * A bitfield class for managing binary flags.
 * Allows checking, applying, and validating flags using bitwise operations.
 */
export default class Bitfield<FlagType> {
	/**
	 * Creates a new Bitfield instance.
	 * @param raw The raw numeric value representing the bitfield.
	 */
	constructor(public raw: number) {}

	/**
	 * Checks if a specific bit is set in the bitfield.
	 * @param bit The bit to check.
	 * @returns True if the bit is set, false otherwise.
	 */
	has(bit: FlagType): boolean {
		return (
			(this.raw & (bit as unknown as number)) === (bit as unknown as number)
		);
	}

	/**
	 * Checks if all specified bits are set in the bitfield.
	 * @param bits An array of bits to check.
	 * @returns True if all bits are set, false otherwise.
	 */
	hasAll(bits: FlagType[]): boolean {
		return bits.every((bit) => this.has(bit));
	}

	/**
	 * Applies (sets) multiple bits to the bitfield.
	 * @param bits An array of bits to apply.
	 * @returns The current Bitfield instance for chaining.
	 */
	apply(bits: FlagType[]): this {
		this.raw |= bits.reduce((a, b) => {
			return a | (b as unknown as number);
		}, 0);
		return this;
	}
}