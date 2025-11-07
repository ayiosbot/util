/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Ayios. All rights reserved.
 *  All code within this repository created by Ayios is under MIT license. Other code within
 *  this repository is under its own respective license which will be displayed within their
 *  respective files or around the areas of their code.
 *  See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ObjectId } from 'mongodb';

interface ReviveJSONOptions {
    /** If true, `_id` fields will be converted to `ObjectId`. */
    oid?: boolean;
    /** If true, fields ending in `At` or `_at` will be parsed as timestamps and converted to `Date`. */
    timestamp?: boolean;
    /** Specific options to match timestamp-like keys. Defaults are typically `At` or `_at` suffixes. */
    created_at?: boolean;
    /** Specific options to match timestamp-like keys. Defaults are typically `At` or `_at` suffixes. */
    createdAt?: boolean;
}

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
    /**
     * Recursively revives an object by converting specific properties based on the provided options.
     * This method will transform certain properties like `_id` to `ObjectId` and timestamp-like fields to `Date` objects.
     *
     * @param object The object to transform
     * @param options Options to determine which fields will be transformed
     * @example
     * const object = {
     *     _id: '507f191e810c19729de860ea',
     *     createdAt: '2021-01-01T00:00:00Z'
     * };
     * const options = { oid: true, timestamp: true, createdAt: true };
     *
     * reviveObjectJSON(object, options); // The `_id` is converted to an ObjectId and `createdAt` is converted to a Date.
     */
    reviveObjectJSON(object: any, options: ReviveJSONOptions) {
        const evaluateKey = (key: string, value: any) => {
            if (options.oid && key === '_id' && ObjectId.isValid(value)) {
                return ObjectId.createFromHexString(value);
            }
            if (options.timestamp && typeof value === 'string') {
                if ((options.createdAt && key.endsWith('At')) || (options.created_at && key.endsWith('_at'))) {
                    const parsed = Date.parse(value);
                    if (!isNaN(parsed)) return new Date(parsed)
                }
            }
            return value;
        }
        const revive = (obj: any) => {
            for (const key of Object.keys(obj)) {
                const value = obj[key];
                if (typeof value === 'object') {
                    revive(obj[key]);
                } else obj[key] = evaluateKey(key, value);
            }
        }
        revive(object);
    }
}