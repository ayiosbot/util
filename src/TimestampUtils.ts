/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Ayios. All rights reserved.
 *  All code within this repository created by Ayios is under MIT license. Other code within
 *  this repository is under its own respective license which will be displayed within their
 *  respective files or around the areas of their code.
 *  See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export type TimestampFormat = | 'F' | 'f' | 'D' | 'd' | 'T' | 't' | 'R';

export default {
    /**
     * Formats a timestamp in seconds to Discord timestamp format.
     * @param seconds The timestamp in seconds.
     * @param format The Discord timestamp format to use (default: 'R' for relative time).
     * @returns A Discord-formatted timestamp string.
     */
    sec(seconds: number, format: TimestampFormat = 'R') {
        return `<t:${Math.floor(seconds)}:${format}>`;
    },
    /**
     * Formats a timestamp in milliseconds to Discord timestamp format.
     * @param milliseconds The timestamp in milliseconds.
     * @param format The Discord timestamp format to use (default: 'R' for relative time).
     * @returns A Discord-formatted timestamp string.
     */
    ms(milliseconds: number, format: TimestampFormat = 'R') {
        return this.sec(milliseconds / 1000, format);
    },
    /**
     * Formats a Date object to Discord timestamp format.
     * @param date The Date object to format.
     * @param format The Discord timestamp format to use (default: 'R' for relative time).
     * @returns A Discord-formatted timestamp string.
     */
    date(date: Date, format: TimestampFormat = 'R') {
        return this.ms(date.getTime(), format);
    }
}