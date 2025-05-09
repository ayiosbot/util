/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Ayios. All rights reserved.
 *  All code within this repository created by Ayios is under MIT license. Other code within
 *  this repository is under its own respective license which will be displayed within their
 *  respective files or around the areas of their code.
 *  See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export default {
    CURRENCY_SYMBOL: '$',
    CURRENCY_SEPARATOR: '',
    /**
     * Cuts a string off at {max} displaying ... at the end
     * @param str The string to cutoff
     * @param max The maximum length the string can be before cutting off
     * @returns A cut string length: `max` + 3
     * @example
     * cutoff("HelloWorld", 5) // Hello...
     * cutoff("Hey!") // Hey!
     */
    cutoff(str: string, max: number): string {
        return str.length < max ? str : `${str.substring(0, max)}...`;
    },
    /**
     * Format a number into a readable string.
     * @param integer The number to format
     * @returns A formatted string
     * @example console.log(formatNumber(1000)) // Output: 1,000
     */
    formatNumber(integer: number): string {
        return integer.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    /**
     * Capitalize the first letter of a string
     * @param str The string to capitalize
     * @returns 
     */
    capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    /**
     * Returns a currency-formatted string
     * @param amount The amount to display
     * @returns The currency
     */
    currency(amount: number) {
        return `${this.CURRENCY_SYMBOL}${this.CURRENCY_SEPARATOR}${this.formatNumber(amount)}`;
    },
    /** Format code as a code block to be used in Discord */
    formatCode(code: string, language: string = 'js'): string {
        return `\`\`\`${language}\n${code}\`\`\``;
    }
}