export type PageFunction<T> = (page: number, items: T[]) => Promise<void>;

/**
 * A pagination utility class for managing and iterating through paginated content.
 * Useful for breaking up large lists into smaller chunks and processing them page by page.
 */
export default class Pages<T> {
    /**
     * @warning This is a promise
     * 
     * General page logic. Usually used for building embeds
     */
    public onPage: PageFunction<T> = async () => {};
    /**
     * @warning This is a promise
     * 
     * General "after" logic. Usually used for resetting embeds
     */
    public afterPage: PageFunction<T> = async () => {};
    /** The contents of *all* pages combined. */
    public contents: T[];
    /** The number of items to be displayed per page. */
    public itemsPerPage: number;
    /** The current page. This starts at `1` */
    public currentPage: number;
    /** The total number of pages. This begins with `1` */
    public totalPages: number;
    
    /**
     * Creates a new Pages instance.
     * @param list The complete list of items to paginate.
     * @param itemsPerPage The number of items to display per page (default: 10).
     */
    constructor(list: T[], itemsPerPage: number = 10) {
        this.contents = list;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.totalPages = Math.ceil(list.length / itemsPerPage);
    }
    /**
     * Starts iteration over the pages.
     * This will call `onPage` for each page, passing the page number and the items on that page.
     * After `onPage` is called, it will call `afterPage` with the same parameters.
     */
    public async flip(): Promise<void> {
        for (let i = 0; i < this.totalPages; i++) {
            const batch = this.contents.slice((i * this.itemsPerPage), (i * this.itemsPerPage) + this.itemsPerPage);
            this.currentPage = i + 1;

            await this.onPage(this.currentPage, batch);
            await this.afterPage(this.currentPage, batch);
        }
    }
    /**
     * Get a page by its number. This does not call any page functions (`onPage` or `afterPage`).
     * @param page The page number to retrieve
     */
    public async getPage(page: number): Promise<T[]> {
        return this.contents.slice((page - 1) * this.itemsPerPage, page * this.itemsPerPage) as T[];
    }
}