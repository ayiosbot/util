/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Ayios. All rights reserved.
 *  All code within this repository created by Ayios is under MIT license. Other code within
 *  this repository is under its own respective license which will be displayed within their
 *  respective files or around the areas of their code.
 *  See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ObjectId } from 'mongodb';
import fs from 'fs';
import os from 'os';
import path from 'path';
import StringUtils from './StringUtils';
import ObjectUtils from './ObjectUtils';

export { default as CalculatePercentile } from './CalculatePercentile';
export { default as Colors } from './Colors';
export { default as ms } from './ms';
export { default as Mutex } from './Mutex';
export { default as PrettyBytes } from './PrettyBytes';
export { default as PrettyMilliseconds } from './PrettyMilliseconds';
export { default as Redlock } from './Redlock';
export * as FuzzyFinder from './FuzzyFinder';
export * as Snowflake from './Snowflake'


export interface SearchDirectoryOptions {
    excludeStartsWith?: string[];
    /** Automatically assigns (can be overwritten) [ `.d.ts`, `.map` ] */
    excludeEndsWith?: string[];
    excludeFiles?: string[];
    /** If provided, this will remove extensions. If the file is not in this list, it'll disregard */
    includeFiles?: string[];
    /** Default false */
    requireBeforeExec?: boolean;
    /** Function to run. Passes the path of file and, if requireBeforeExec, the required file */
    exec?: Function;
}

export interface PackageJSON {
    name: string;
    version: string;
    description: string;
    repository?: string;
}

const HOSTNAME = os.hostname();

export default {
    /** String utility functions */
    get string(): typeof StringUtils { return StringUtils },
    get object(): typeof ObjectUtils { return ObjectUtils },
    /** Returns dev/prod based on platform (always 'dev' for win32) */
    get environment() {
        // return 'dev';
        return process.platform === 'win32' ? 'dev' : 'prod';
        // return 'prod'; // Override for production testing
    },
    get isProd() {
        return this.environment === 'prod';
    },
    get hostname() {
        if (!this.isProd) return 'local';
        return HOSTNAME;
    },
    /** Read a package json. Uses direct path to the json file. */
    packageJSON(directory: string) {
        return require(path.join(directory)) as PackageJSON;
    },
    /** Return an array of shards using the first and last shard ID */
    managedShards(firstShardID: number, lastShardID: number): number[] {
        const shards = [];
        for (let i = firstShardID; i < lastShardID + 1; i++) {
            shards.push(i);
        }
        return shards;
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
     * Search a directory. For the legacy function, use `legacySearchDir()`
     * @param directory The directory to search
     * @param options Directory search options. Automatically assigns (can be overwritten) excludeEndsWith: [ `.d.ts`, `.map` ].
     */
    async search(directory: string, options?: SearchDirectoryOptions): Promise<void> {
        options = Object.assign({}, <SearchDirectoryOptions>{
            excludeEndsWith: [ '.d.ts', '.map' ],
            excludeStartsWith: [],
            excludeFiles: [],
            includeFiles: [],
            requireBeforeExec: false,
            exec: () => {}
        }, options);
        
        const recursive = async (dir: string) => {
            const files = await fs.promises.readdir(dir);
            for (const file of files) {
                const currentPath = path.join(dir, file);
                const stat = await fs.promises.stat(currentPath);

                if (stat.isDirectory()) {
                    await recursive(currentPath);
                } else {
                    const rawfile = file.split('.')[0];
                    let doContinue = false;
                    for (const str of options.excludeEndsWith!) {
                        if (file.endsWith(str)) { doContinue = true; break; };
                    }
                    if (doContinue) continue;

                    for (const str of options.excludeStartsWith!) {
                        if (file.startsWith(str)) continue;
                    }

                    for (const filename of options.excludeFiles!) {
                        // Evaluate the exclusion "example" or "example.js"
                        if (rawfile === filename || file === filename) continue;
                    }

                    if (options.includeFiles!.length > 0) {
                        if (
                            !options.includeFiles!.includes(rawfile)
                            || options.includeFiles!.includes(file)
                        ) continue;
                    }

                    const requiredFile = options.requireBeforeExec ? require(currentPath) : null;
                    options.exec!(currentPath, requiredFile)
                }
            }
        }

        try {
            await recursive(directory);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    },
    /**
     * @deprecated This will be removed. Likely somewhere in 1.9+
     * 
     * Legacy directory search. To be removed eventually.
     * @param directory Directory to search
     * @param execFunction The function to execute
     * @param excludeFiles Exclusion files
     * @param includeFiles Inclusion files (will exclude anything else. Do not include extension)
     */
    legacySearchDir(directory: string, execFunction: Function, excludeFiles?: string[], includeFiles?: string[]) {
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