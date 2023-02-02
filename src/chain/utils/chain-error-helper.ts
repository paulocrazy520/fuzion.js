import {ContractQueryError} from "../errors/contract-query-error";
import {SmartContractName} from "../enums/smart-contract-name";
import {ErrorMessages} from "../constants/error-messages";

export class ChainErrorHelper {

    public static getContractQueryError = (error: any, msg: string, contractName: SmartContractName): ContractQueryError => {
        const errorCode = this.getErrorCode(error)

        //If we don't get a valid error code
        if (errorCode === -1) {
            return new ContractQueryError(msg, ErrorMessages.GENERAL_ERROR_CODE_UNAVAILABLE, error)
        }

        const friendlyErrorMsg = this.getFriendlyErrorMessage(contractName, errorCode)

        const cqe = new ContractQueryError(msg, friendlyErrorMsg, error)
        return cqe
    }

    private static getErrorCode = (error: any): number => {
        const errorMsg = error.message

        if (errorMsg.toLowerCase().startsWith('query failed with (')) {
            const colonIndex = errorMsg.indexOf(':')
            const errorCodeString = errorMsg.substring(0, colonIndex)

            const errorCodeStr = errorCodeString.replace(/\D/g, '')
            const errorCodeNum = parseInt(errorCodeStr)

            if (!Number.isNaN(errorCodeNum)) {
                return errorCodeNum
            }
        }

        return -1
    }

    private static getFriendlyErrorMessage = (contractName: SmartContractName, errorCode: number): string => {
        let msg = ''

        if (contractName === SmartContractName.OTC_CONTRACT) {
            switch (errorCode) {
                case 18:
                    msg = ErrorMessages.OTC_ERROR_18
                    break
                case 19:
                    msg = ErrorMessages.OTC_ERROR_19
                    break
                default:
                    msg = ErrorMessages.GENERAL_ERROR_CODE_UNRECOGNISED
            }
        }

        if (msg !== '' && contractName === SmartContractName.UTILS_CONTRACT) {
            switch (errorCode) {
                default:
                    msg = ErrorMessages.GENERAL_ERROR_CODE_UNRECOGNISED
            }
        }

        if (msg !== '' && contractName === SmartContractName.REACTOR_SWAP_CONTRACT) {
            switch (errorCode) {
                default:
                    msg = ErrorMessages.GENERAL_ERROR_CODE_UNRECOGNISED
            }
        }

        return msg
    }
}