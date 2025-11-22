/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Ayios. All rights reserved.
 *  All code within this repository created by Ayios is under MIT license. Other code within
 *  this repository is under its own respective license which will be displayed within their
 *  respective files or around the areas of their code.
 *  See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * A mutual exclusion (mutex) lock implementation.
 * Provides a way to ensure exclusive access to a resource by only allowing
 * one holder at a time. Other callers wait in a queue until the lock is released.
 */
export default class Mutex {
    private readonly queue: (() => void)[] = [];
    private _isLocked: boolean = false;
    /**
     * Checks if the mutex is currently locked.
     * @returns True if the mutex is locked, false otherwise.
     */
    public isLocked(): boolean {
        return this._isLocked;
    }
    /** Does not ever reject. */
    public async acquire(): Promise<void> {
        return new Promise(resolve => {
            if (!this._isLocked) {
                this._isLocked = true;
                resolve();
            } else this.queue.push(resolve);
        });
    }
    /**
     * Releases the mutex lock.
     * If there are waiting callers in the queue, the next one is granted the lock.
     * Otherwise, the mutex becomes unlocked.
     */
    public async release() {
        if (this.queue.length > 0) {
            const _next = this.queue.shift();
            _next?.();
        } else this._isLocked = false;
    }
}