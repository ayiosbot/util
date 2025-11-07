/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Ayios. All rights reserved.
 *  All code within this repository created by Ayios is under MIT license. Other code within
 *  this repository is under its own respective license which will be displayed within their
 *  respective files or around the areas of their code.
 *  See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import fs from 'fs';
import os from 'os';
import path from 'path';


import ArrayUtils from './ArrayUtils';
import NumberUtils from './NumberUtils';
import ObjectUtils from './ObjectUtils';
import StringUtils from './StringUtils';
import TimestampUtils from './TimestampUtils';

export { default as Bucket } from './Bucket';
export { default as Colors } from './Colors';
export { default as ms } from './ms';
export { default as Mutex } from './Mutex';
export { default as Pages } from './Pages';
export { default as PrettyBytes } from './PrettyBytes';
export { default as PrettyMilliseconds } from './PrettyMilliseconds';

export { DeconstructedSnowflake, DiscordSnowflake, SnowflakeGenerateOptions } from './Snowflake';
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
    /** Array utility functions */
    get array(): typeof ArrayUtils { return ArrayUtils },
    /** Number utility functions */
    get number(): typeof NumberUtils { return NumberUtils },
    /** Object utility functions */
    get object(): typeof ObjectUtils { return ObjectUtils },
    /** String utility functions */
    get string(): typeof StringUtils { return StringUtils },
    /** Default timestamp format: `R` */
    get timestamp(): typeof TimestampUtils { return TimestampUtils },
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
     * Easy shortcut for a wait function
     * @param  {number} timeMs
     * @param  {boolean=false} doReject Rejects with 'promise timed out' if true and times out
     */
    async wait(timeMs: number, doReject: boolean = false): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => doReject ? reject('promise timed out') : resolve(), timeMs);
        });
    },
    /**
     * @important Rejects with 'promise timed out' as an error response
     * @param  {Promise<unknown>} promise
     * @param  {number} timeout
     */
    async timeoutPromise<T>(promise: Promise<T>, timeout: number) {
        return Promise.race([ promise, this.wait(timeout, true) ])
    },
    /**
     * Executes <action> if the promise is resolved.
     * @important Resolves first, then calls the function. This will also resolve with the result of the promise.
     * @param  {Promise<unknown>} promise
     * @param  {Function} action
     * @returns Promise
     */
    async promiseAction<T>(promise: Promise<T>, action: (result: T) => void): Promise<T> {
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
    /**
     * Checks if an object is an instance of a class. Does not use normal `instanceof`.
     * 
     * Useful if modules are split in a weird way and instanceof returns different results based on odd dependencies.
     * @param obj The object to check
     * @param classname The class name to check against
     * @returns Generic `T` or false.
     * @example
     * ```ts
        const msg = this.instanceof<Promise<void>>(promise, 'Promise');
        // The above will be typed. If it exists, it will maintain the type of Promise<void>.
     * ```
     */
    instanceof<T>(obj: any, classname: string): T | false {
        if (obj.constructor.name === classname) {
            return obj as T;
        }
        return false;
    }
}