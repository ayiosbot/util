/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Ayios. All rights reserved.
 *  All code within this repository created by Ayios is under MIT license. Other code within
 *  this repository is under its own respective license which will be displayed within their
 *  respective files or around the areas of their code.
 *  See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export type TimestampFormat = | 'F' | 'f' | 'D' | 'd' | 'T' | 't' | 'R';

export default {
    sec(seconds: number, format: TimestampFormat = 'R') {
        return `<t:${Math.floor(seconds)}:${format}>`;
    },
    ms(milliseconds: number, format: TimestampFormat = 'R') {
        return this.sec(milliseconds / 1000, format);
    },
    date(date: Date, format: TimestampFormat = 'R') {
        return this.ms(date.getTime(), format);
    }
}