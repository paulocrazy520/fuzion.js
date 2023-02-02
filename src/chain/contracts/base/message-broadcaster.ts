import {AccountData, OfflineSigner} from "@cosmjs/proto-signing";
import {ContractHelper} from "../../utils/contract-helper";
import {ExecuteResult} from "@cosmjs/cosmwasm-stargate";
import {Coin} from "@cosmjs/stargate";

/**
 * A class that provides base functions for smart contract interactions.
 * This class should be extended on a per smart contract basis, with each extension class containing
 * bespoke functions for the execute and query messages of that contract.
 */
export class MessageBroadcaster {
    readonly contractAddress: string
    readonly wallet: OfflineSigner
    readonly rpcEndpoint: string
    readonly contractHelper: ContractHelper

    /**
     * Initialises the class against a contract, which will be used for all executes and queries.
     * @param contractAddress The address of the smart contract to interact with.
     * @param wallet The wallet to be used during smart contract executions.
     * @param rpcEndpoint The RPC Endpoint to query the smart contract at.
     * @param contractHelper A helper class that performs the message executes and queries.
     */
    constructor(contractAddress: string, wallet: OfflineSigner, rpcEndpoint: string, contractHelper: ContractHelper) {
        this.contractAddress = contractAddress
        this.wallet = wallet
        this.rpcEndpoint = rpcEndpoint
        this.contractHelper = contractHelper
    }

    /**
     * Executes the provided message against the contract address that was passed into the constructor.
     * @param executeMessage The message to execute.
     * @param memo A memo for the transaction.
     * @param funds Any funds to be sent with the transaction.
     * @param accountIndex The accountIndex to execute against. Defaulted to 0.
     * @returns The ExecuteResult of the transaction.
     */

    protected executeContract = async (executeMessage: Record<string, unknown>, memo = '', funds:Coin[] = [], accountIndex = 0): Promise<ExecuteResult> => {
        const result = await this.contractHelper.executeContract(this.contractAddress, this.wallet, executeMessage, memo, funds, accountIndex)
        return result
    }

    /**
     * Queries the contract address that was passed into the constructor, using the supplied message.
     * @param queryMessage The message to query the contract with.
     * @returns The results of the query.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected queryContract = async (queryMessage: Record<string, unknown>): Promise<any> => {
        const result = await this.contractHelper.queryContract(this.contractAddress, queryMessage)

        return result
    }

    /**
     * Retrieves AccountData from the wallet that was passed into the constructor, at the
     * index of the passed in accountIndex.
     * @param accountIndex The index of the account.
     * @returns The AccountData for the account.
     */
    protected getAccount = async (accountIndex = 0): Promise<AccountData> => {
        //todo: handle out of bounds scenario.
        const accounts = await this.wallet.getAccounts()
        return accounts[accountIndex]
    }
}