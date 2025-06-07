/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Ayios. All rights reserved.
 *  All code within this repository created by Ayios is under MIT license. Other code within
 *  this repository is under its own respective license which will be displayed within their
 *  respective files or around the areas of their code.
 *  See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export default {
    /** Remove a single array element. Returns the element enclosed in an array */
    removeIndex<T>(array: T[], index: number): T[] {
        return array.splice(index, 1) as T[];
    },
    /**
     * Removes an element from an array by its value.
     * 
     * This returns the removed element, or undefined if the element was not found.
     * @param array The array from which to remove the element.
     * @param element The element to remove from the array.
     * @returns 
     */
    removeElement<T>(array: T[], element: any): T | undefined {
        const index = array.indexOf(element);
        if (index > -1) {
            return this.removeIndex(array, index)[0];
        }

        return undefined;
    }
}