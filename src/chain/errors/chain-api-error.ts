/**
 * A custom error class to wrap errors that are returned when querying the chain api.
 */
export class ChainApiError extends Error {
    /**
     * Contains the error returned from the chain api.
     */
    innerError:any

    constructor(msg: string) {
        super(msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ChainApiError.prototype);
    }
}