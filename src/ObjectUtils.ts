/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Ayios. All rights reserved.
 *  All code within this repository created by Ayios is under MIT license. Other code within
 *  this repository is under its own respective license which will be displayed within their
 *  respective files or around the areas of their code.
 *  See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export default {
    /**
     * Return the key that a value is indexed by
     * @param dictionary The dictionary to search
     * @param value The value to return
     * @returns The key the value is indexed by
     * 
     * @example
     * ```ts
     * const dict = { first: 1, second: 2, third: 3 }
     * console.log(findIndexByValue(1)) // Output: 'first'
     * ```
     */
    findIndexByValue(dictionary: { [key: string]: any }, value: any): string | void {
        for (const [ key, dictValue ] of dictionary.entries(dictionary)) {
            if (dictValue === value) return key;
        }
    },
}