import { ObjectId } from 'mongodb';
import path from 'path';
import fs from 'fs';

export { default as CalculatePercentile } from './CalculatePercentile';
export { default as Colors } from './Colors';
export { default as ms } from './ms';
export { default as Mutex } from './Mutex';
export { default as PrettyBytes } from './PrettyBytes';
export { default as PrettyMilliseconds } from './PrettyMilliseconds';
export { default as Redlock } from './Redlock';
export * as FuzzyFinder from './FuzzyFinder';
export * as Snowflake from './Snowflake'

export default {
    /** Returns dev/prod based on platform (always 'dev' for win32) */
    get environment() {
        // return 'dev';
        return process.platform === 'win32' ? 'dev' : 'prod';
        // return 'prod'; // Override for production testing
    },
    get isProd() {
        return this.environment === 'prod';
    },
    /** Cuts a string off at {max} displaying ... at the end */
    cutoff(str: string, max: number): string {
        return str.length < max ? str : `${str.substring(0, max)}...`;
    },
    /** Return key searched by value */
    dictionaryByValue(list: { [key: string]: any }, value: any): string | void {
        for (const [ key, dictValue ] of Object.entries(list)) {
            if (dictValue === value) return key;
        }
    },
    /** Returns flags a flag has (number[]) */
    flagsAll<T = number>(flags: T, comparison: { [key: string]: T }): T[] {
        // flagsAll(0, {mod:1,admin:2})
        const flagsArray: T[] = [];
        for (const [ key, flag ] of Object.entries(comparison)) {
            if ((flags as any) & (flag as any)) {
                flagsArray.push(flag);
            }
        }
        return flagsArray;
    },
    parseProperties<T = any>(value: string): T {
        const values = value.split(';').map(v => v.split('='));
        const records: Record<string, string> = {};
        values.forEach(v => records[v[0]] = v[1]);
        return records as T;
    },
    /**
     * Turn a number into a readable string.
     * 
     * Example: `1000 => 1,000`
     * @param  {number} integer
     * @returns string
     */
    formatNumber(integer: number): string {
        return integer.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    searchDir(directory: string, execFunction: Function, excludeFiles?: string[], includeFiles?: string[]) {
        const search = (dir: string) => {
            fs.readdirSync(dir).forEach(file => {
                const joined = path.join(dir, file);
                const stat = fs.statSync(joined);
                if (stat.isDirectory()) {
                    search(joined);
                } else if (stat.isFile()) {
                    if (file.endsWith('.map')) return;
                    if (file.startsWith('$')) return;
                    if (excludeFiles && excludeFiles.includes(file.split('.')[0])) return;
                    if (includeFiles && !includeFiles.includes(file.split('.')[0])) return;
                    const _file = require(joined);
                    execFunction(joined, _file);
                }
            })
        }
        search(directory)
    },
    // Capitalize the first letter
    capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    /**
     * Easy shortcut for a wait function
     * @param  {number} timeMs
     * @param  {boolean=false} doReject Rejects with 'promise timed out' if true and times out
     */
    async wait(timeMs: number, doReject: boolean = false) {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => doReject ? reject('promise timed out') : resolve(), timeMs);
        });
    },
    /**
     * @important Rejects with 'promise timed out' as an error response
     * @param  {Promise<unknown>} promise
     * @param  {number} timeout
     */
    async timeoutPromise(promise: Promise<unknown>, timeout: number) {
        return Promise.race([ promise, this.wait(timeout, true) ])
    },
    /**
     * Executes <action> if the promise is resolved.
     * @important Resolves first, then calls the function. This will also resolve with the result of the promise.
     * @param  {Promise<unknown>} promise
     * @param  {Function} action
     * @returns Promise
     */
    async promiseAction(promise: Promise<unknown>, action: Function): Promise<unknown> {
        return new Promise((resolve, reject) => {
            promise.then(result => {
                resolve(result);
                action(result);
            }).catch(reject);
        });
    },
    isClass(obj: any): boolean {
        const isCtorClass = obj.constructor
            && obj.constructor.toString().substring(0, 5) === 'class'
        if(obj.prototype === undefined) {
          return isCtorClass
        }
        const isPrototypeCtorClass = obj.prototype.constructor 
          && obj.prototype.constructor.toString
          && obj.prototype.constructor.toString().substring(0, 5) === 'class'
        return isCtorClass || isPrototypeCtorClass
    },
    evaluateKey(key: string, value: any) {
        if (key === '_id' && ObjectId.isValid(value)) {
            return ObjectId.createFromHexString(value);
        }
        if (key.endsWith('_at') && typeof value === 'string') {
            const parsed = Date.parse(value);
            if (!isNaN(parsed)) return new Date(parsed);
        }
        return value;
    },
    objectRevive(object: any) {
        const recurse = (obj: any) => {
            for (const key of Object.keys(obj)) {
                const value = obj[key];
                if (typeof value === 'object') {
                    recurse(obj[key]);
                } else {
                    obj[key] = this.evaluateKey(key, value);
                    // if (key.endsWith('_at') && typeof value === 'string') {
                    //     const parsed = Date.parse(value);
                    //     if (!isNaN(parsed)) obj[key] = new Date(parsed);
                    // }
                    // if (key === '_id' && ObjectId.isValid(value)) {
                    //     obj[key] = ObjectId.createFromHexString(value);
                    // }
                }
            }
        }
        recurse(object);
    },
    JSONParseReviver(key: string, value: any) {
        return this.evaluateKey(key, value);
        // if (key === '_id' && ObjectId.isValid(value)) return ObjectId.createFromHexString(value);
        // if (key.endsWith('_at') && typeof value === 'string') { // Assume that it's a date.
        //     const parsed = Date.parse(value);
        //     if (!isNaN(parsed)) return new Date(parsed);
        // }
        // return value;
    },
}