/**
 * A custom error class to raise invalid parameters when they are encountered.
 */
export class InvalidParameterError extends Error {
    constructor(msg: string) {
        super(msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidParameterError.prototype);
    }
}