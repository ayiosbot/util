/*---------------------------------------------------------------------------------------------
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2021 abalabahaha
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * --------------------------------------------------------------------------------------------
 * This file was obtained from:
 * https://github.com/abalabahaha/eris/blob/dev/lib/util/Bucket.js (eb403730855714eafa36c541dbe2cb84c9979158)
 *--------------------------------------------------------------------------------------------*/

/** A bucket. */
export default class Bucket {
    private _queue: Array<{ priority: boolean; func(): void;}> = [];
    public interval: number;
    public lastReset: number;
    public lastSend: number;
    public latencyRef: { latency: number; };
    public reservedTokens: number;
    public timeout: NodeJS.Timeout | null;
    public tokenLimit: number;
    public tokens: number;
    constructor(tokenLimit: number, interval: number, options?: { latencyRef?: { latency: number; }; reservedTokens?: number; }) {
        this.tokenLimit = tokenLimit;
        this.interval = interval;
        this.latencyRef = options?.latencyRef ?? { latency: 0 };
        this.lastReset = this.tokens = this.lastSend = 0;
        this.reservedTokens = options?.reservedTokens ?? 0;
        this.timeout = null;
    }

    get areTokensAvailable() {
        return this.tokens < this.tokenLimit;
    }

    public updateRateLimit(newTokenLimit: number, newInterval: number): void {
        this.tokenLimit = newTokenLimit;   // Set the new token limit
        this.interval = newInterval;       // Set the new interval (time window)

        // Reset tokens correctly to ensure next request is deducted properly
        this.lastReset = Date.now();       // Reset the last reset time
        this.tokens = Math.max(0, this.tokens - 1); // Consume 1 token for the request that triggered this update

        this.check(); // Process the queue with new rate limits
    }

    /**
     * Add an item to the queue.
     * @param func The function to queue.
     * @param priority If true, the item will be added to the front of the queue.
     */
    public queue(func: () => void, priority = false): void {
        if (priority) {
            this._queue.unshift({ func, priority });
        } else {
            this._queue.push({ func, priority });
        }
        this.check();
    }

    private check(): void {
        if (this.timeout || this._queue.length === 0) {
            return;
        }
        if (this.lastReset + this.interval + this.tokenLimit * this.latencyRef.latency < Date.now()) {
            this.lastReset = Date.now();
            this.tokens = Math.max(0, this.tokens - this.tokenLimit);
        }

        let val: number;
        // let tokensAvailable = this.tokens < this.tokenLimit;
        // let tokensAvailable = this.isAvailable;
        let unreservedTokensAvailable = this.tokens < (this.tokenLimit - this.reservedTokens);
        while (this._queue.length !== 0 && (unreservedTokensAvailable || (this.areTokensAvailable && this._queue[0].priority))) {
            this.tokens++;
            // tokensAvailable = this.tokens < this.tokenLimit;
            unreservedTokensAvailable = this.tokens < (this.tokenLimit - this.reservedTokens);
            const item = this._queue.shift();
            val = this.latencyRef.latency - Date.now() + this.lastSend;
            if (this.latencyRef.latency === 0 || val <= 0) {
                item!.func();
                this.lastSend = Date.now();
            } else {
                setTimeout(() => {
                    item!.func();
                }, val);
                this.lastSend = Date.now() + val;
            }
        }

        if (this._queue.length !== 0 && !this.timeout) {
            this.timeout = setTimeout(() => {
                this.timeout = null;
                this.check();
            }, this.tokens < this.tokenLimit ? this.latencyRef.latency : Math.max(0, this.lastReset + this.interval + this.tokenLimit * this.latencyRef.latency - Date.now()));
        }


    }
}