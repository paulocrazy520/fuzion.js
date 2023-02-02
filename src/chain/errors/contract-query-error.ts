/**
 * A custom error class to wrap errors that are returned when querying smart contracts.
 */
export class ContractQueryError extends Error {
    /**
     * Contains the error returned from the smart contract.
     */
    innerError:any
    friendlyErrorMessage:string

    get hasFriendlyErrorMessage() {
        if(this.friendlyErrorMessage.trim() === ''){
            return false
        }

        return true
    }

    constructor(msg: string, friendlyErrorMessage:string, innerError:any) {
        super(msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ContractQueryError.prototype);

        this.innerError = innerError
        this.friendlyErrorMessage = friendlyErrorMessage
    }
}