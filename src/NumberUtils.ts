/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Ayios. All rights reserved.
 *  All code within this repository created by Ayios is under MIT license. Other code within
 *  this repository is under its own respective license which will be displayed within their
 *  respective files or around the areas of their code.
 *  See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export default {
    /** Validates the number. Only useful if relying on user-input, typically via API. */
    validate(v: any) {
        if (typeof v === 'string' && v.trim() !== '') { // isFinite() returns true for an empty string
            v = +v;
        }
        if (typeof v === 'number') {
            return Number.isFinite(v)
                && Number.isSafeInteger(v) && v - v === 0;
        }
        return false;
    }
}