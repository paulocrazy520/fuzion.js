import {calculateFee, GasPrice, StdFee, Coin} from "@cosmjs/stargate";
import {ExecuteResult, InstantiateOptions, InstantiateResult, SigningCosmWasmClient, UploadResult} from "@cosmjs/cosmwasm-stargate";
import {OfflineSigner} from "@cosmjs/proto-signing";
import {TerminalLogger} from "./terminal-logger";

/**
 * Helper class to interact with smart contracts.
 */
export class ContractHelper {
    rpcEndpoint: string
    gasPrice?: GasPrice

    constructor (rpcEndpoint: string, gasPrice?: GasPrice) {
        TerminalLogger.log(`Initialising ContractHelper with endpoint ${rpcEndpoint}`)
        this.rpcEndpoint = rpcEndpoint
        this.gasPrice = gasPrice
    }

    /**
     * Performs an upload of a contract to the chain.
     * @param wallet The wallet to use in the contract upload.
     * @param wasm Buffer of the wasm binary file.
     * @param accountIndex The index of the account in the provided wallet.
     * @param fee The fee to use in the message.
     * @returns The ExecuteResult from the transaction.
     */
    uploadContract = async (wallet: OfflineSigner,
                            wasm: Buffer,
                            accountIndex = 0,        
                            fee: number | StdFee | "auto" = "auto"):Promise<UploadResult> => {
        const accounts = await wallet.getAccounts()
        const account = accounts[accountIndex]

        const cwClient = await SigningCosmWasmClient.connectWithSigner(this.rpcEndpoint, wallet, { gasPrice: this.gasPrice })
        const broadcastResult = await cwClient.upload(account.address, wasm, fee);
        return broadcastResult
    }

    /**
    * Performs an instantiate of an uploaded wasm contract.
    * @param wallet The wallet to use in the message execute.
    * @param codeId The code ID of the contract to instantiate.
    * @param initiateMessage The message to initiate.
    * @param label The label of the contract to instantiate.
    * @param admin The admin of the contract to instantiate.
    * @param accountIndex The index of the account in the provided wallet.
    * @param fee The fee to use in the message.
    * @returns The ExecuteResult from the transaction.
    */
    instantiateContract = async (wallet: OfflineSigner,
                                 codeId: number,
                                 instantiateMessage: Record<string, unknown>,
                                 label: string,
                                 admin?: string,                              
                                 accountIndex = 0,        
                                 fee: number | StdFee | "auto" = "auto"):Promise<InstantiateResult> => {
        const accounts = await wallet.getAccounts()
        const account = accounts[accountIndex]

        const cwClient = await SigningCosmWasmClient.connectWithSigner(this.rpcEndpoint, wallet, { gasPrice: this.gasPrice })
        const instantiateOptions: InstantiateOptions = { admin: admin }
        const broadcastResult = await cwClient.instantiate(account.address, codeId, instantiateMessage, label, fee, instantiateOptions);
        return broadcastResult
    }

    /**
     * Performs a message execute against the provided contract.
     * @param contractAddress The address of the smart contract to execute against.
     * @param wallet The wallet to use in the message execute.
     * @param executeMessage The message to execute.
     * @param memo The memo to provide for the transaction.
     * @param funds Any funds that are being sent with the transaction. 
     * @param accountIndex The index of the account in the provided wallet.
     * @param fee The fee to use in the message.
     * @returns The ExecuteResult from the transaction.
     */
    executeContract = async (contractAddress: string,
                             wallet: OfflineSigner,
                             executeMessage: Record<string, unknown>,                             
                             memo = '',
                             funds:Coin[] = [],
                             accountIndex = 0,                             
                             fee: number | StdFee | "auto" = "auto"):Promise<ExecuteResult> => {
        const accounts = await wallet.getAccounts()
        const account = accounts[accountIndex]

        TerminalLogger.log(`Sending execute to ${contractAddress} on endpoint ${this.rpcEndpoint}`)
        TerminalLogger.log(`Execute message: \r\n${JSON.stringify(executeMessage, null, 2)}\r\n`)

        const cwClient = await SigningCosmWasmClient.connectWithSigner(this.rpcEndpoint, wallet, { gasPrice: this.gasPrice })

        TerminalLogger.time('Execute Time')
        const broadcastResult = await cwClient.execute(account.address, contractAddress, executeMessage, fee, memo, funds)
        TerminalLogger.timeEnd('Execute Time')

        TerminalLogger.newLine()
        TerminalLogger.log(`Execute response: \r\n${JSON.stringify(broadcastResult, null, 2)}`)
        return broadcastResult
    }

    /**
     * Performs a query against the provided contract.
     * @param contractAddress The address of the smart contract to execute against.
     * @param queryMessage The message to query with.
     * @returns The result of the query.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryContract = async (contractAddress: string, queryMessage: Record<string, unknown>): Promise<any> => {
        const cwClient = await SigningCosmWasmClient.connectWithSigner(this.rpcEndpoint, null)

        TerminalLogger.log(`Sending query to ${contractAddress} on endpoint ${this.rpcEndpoint}`)
        TerminalLogger.log(`Query message: \r\n${JSON.stringify(queryMessage, null, 2)}\r\n`)

        TerminalLogger.time('Query Time')
        const result = await cwClient.queryContractSmart(contractAddress, queryMessage)
        TerminalLogger.timeEnd('Query Time')

        TerminalLogger.newLine()
        TerminalLogger.log(`Query response: \r\n${JSON.stringify(result, null, 2)}`)
        return result
    }

    /**
     * Calculates an transaction execution fee.
     * @param gasLimit The gas limit to be used in the calculation.
     * @param gasPrice The gas price to be  used in the calculation.
     * @param denom The demon of the fee.
     */
    getExecutionFee = (gasLimit: number, gasPrice: number, denom: string): StdFee => {
        const gasPriceString = GasPrice.fromString(`${gasPrice}${denom}`)
        const fee = calculateFee(gasLimit, gasPriceString)
        return fee
    }
}