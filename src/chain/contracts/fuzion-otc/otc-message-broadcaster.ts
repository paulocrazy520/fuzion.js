import {OfflineSigner} from "@cosmjs/proto-signing";
import {ContractHelper} from "../../utils/contract-helper";
import {ExecuteResult} from "@cosmjs/cosmwasm-stargate";
import {MessageBroadcaster} from "../base/message-broadcaster";
import {OtcMessageBuilder as OtcMsgBuilder} from "./otc-message-builder";
import {EscrowDetails, EscrowDetailsLite,
        OtcConfig, OtcConfigAndPending,
        PairCount, RichEscrowDetails,
        RichTokenBalance } from "./otc-message-types"
import {Coin} from "@cosmjs/stargate";
import {PaginatedResult} from "../../../core/types/paginated-result";
import {TokenProperties} from "../../types/token-types";
import {TokenHelper} from "../../utils/token-helper";
import {UtilitiesMessageBroadcaster} from "../fuzion-utilities/utilities-message-broadcaster";
import {ChainErrorHelper} from "../../utils/chain-error-helper";
import {SmartContractName} from "../../enums/smart-contract-name";

/**
 * Extends the base MessageBroadcaster class and adds functions to execute and query the OTC smart contract.
 */
export class OtcMessageBroadcaster extends MessageBroadcaster {
    private _trustedAssets:TokenProperties[] = undefined
    readonly _utilsContract:UtilitiesMessageBroadcaster


    constructor(contractAddress: string, wallet: OfflineSigner, rpcEndpoint: string, contractHelper: ContractHelper, utilsContract:UtilitiesMessageBroadcaster) {
        super(contractAddress, wallet, rpcEndpoint, contractHelper)
        this._utilsContract = utilsContract
    }


    /**
     * Creates a new Escrow deal using the provided Escrow details.
     * @param escrowDetails The desired details of the new Escrow.
     * @param funds The assets up for sale by the creator.
     * @param memo A memo for the transaction.
     * @param accountIndex The accountIndex to execute against. Defaulted to 0.
     * @returns The ExecuteResult from the transaction.
     */
    public executeCreate = async (escrowDetails: EscrowDetailsLite, funds: Coin[], memo = '', accountIndex = 0): Promise<ExecuteResult> => {
        const msg = OtcMsgBuilder.getCreateExecute(escrowDetails)
        const result = await this.executeContract(msg, memo, funds, accountIndex)

        return result
    }

    /**
     * Refunds an open Escrow. When an Arbiter has been set, then only the Arbiter can execute the refund.
     * When there is no Arbiter set, then the creator can execute the refund.
     * @param id The id of the Escrow to perform the refund on.
     * @param memo A memo for the transaction.
     * @param funds Any funds to be sent with the transaction.
     * @param accountIndex The accountIndex to execute against. Defaulted to 0.
     * @returns The ExecuteResult from the transaction.
     */
    public executeRefund = async (id: number, memo = '', funds: Coin[] = [], accountIndex = 0): Promise<ExecuteResult> => {
        const msg = OtcMsgBuilder.getRefundExecute(id)
        const result = await this.executeContract(msg, memo, funds, accountIndex)

        return result
    }

    /**
     * Sets the receiver address for an Escrow.
     * @param id The id of the Escrow to set the receiver address on.
     * @param receiver The address to set the Escrow receiver to.
     * @param memo A memo for the transaction.
     * @param funds Any funds to be sent with the transaction.
     * @param accountIndex The accountIndex to execute against. Defaulted to 0.
     * @returns The ExecuteResult from the transaction.
     */
    public executeSetReceiver = async (id: number, receiver: string, memo = '', funds: Coin[] = [], accountIndex = 0): Promise<ExecuteResult> => {
        const msg = OtcMsgBuilder.getSetRecipientExecute(id, receiver)
        const result = await this.executeContract(msg, memo, funds, accountIndex)

        return result
    }

    /**
     * Executes a deposit from the receiver of the Escrow. When there is no Arbiter set
     * the Escrow deal will auto approve when the deposit is received.
     * @param id The id of the Escrow to perform the deposit on.
     * @param funds The assets for the deposit.
     * @param memo A memo for the transaction.
     * @param accountIndex The accountIndex to execute against. Defaulted to 0.
     * @returns The ExecuteResult from the transaction.
     */
    public executeReceiverDeposit = async (id: number, funds: Coin[], memo = '', accountIndex = 0): Promise<ExecuteResult> => {
        const msg = OtcMsgBuilder.getReceiverDepositExecute(id)
        const result = await this.executeContract(msg, memo, funds, accountIndex)

        return result
    }

    /**
     * Executes the approval of an Escrow. An approval is only required when there is an Arbiter set.
     * When there is no Arbiter set, the deal will complete automatically on deposit from the receiver.
     * @param id The id of the Escrow to perform the approval on.
     * @param memo A memo for the transaction.
     * @param funds Any funds to be sent with the transaction.
     * @param accountIndex The accountIndex to execute against. Defaulted to 0.
     * @returns The ExecuteResult from the transaction.
     */
    public executeApprove = async (id: number, memo = '', funds: Coin[] = [], accountIndex = 0): Promise<ExecuteResult> => {
        const msg = OtcMsgBuilder.getApproveExecute(id)
        const result = await this.executeContract(msg, memo, funds, accountIndex)

        return result
    }

    /**
     * Updates the contract config. A config update can only be executed by the assigned admin account.
     * The changes are not immediately effective as they need to be approved by a secondary admin.
     * To view the assigned admin wallet address, run the OtcMessageBuilder.queryConfig() function.
     * @param config The desired config values to update the contract config with.
     * @param memo A memo for the transaction.
     * @param funds Any funds to be sent with the transaction.
     * @param accountIndex The accountIndex to execute against. Defaulted to 0.
     * @returns The ExecuteResult from the transaction.
     */
    public executeConfigUpdate = async (config: OtcConfig, memo = '', funds: Coin[] = [], accountIndex = 0): Promise<ExecuteResult> => {
        const msg = OtcMsgBuilder.getUpdateConfigExecute(config)
        const result = await this.executeContract(msg, memo, funds, accountIndex)

        return result
    }

    /**
     * Confirms any pending config changes on the contract. The confirmation can only be executed
     * by the assigned admin wallet. To view the assigned admin wallet address, run the
     * OtcMessageBuilder.queryConfig() function.
     * @param memo A memo for the transaction.
     * @param funds Any funds to be sent with the transaction.
     * @param accountIndex The accountIndex to execute against. Defaulted to 0.
     * @returns The ExecuteResult from the transaction.
     */
    public executeConfirmPendingConfig = async (memo = '', funds: Coin[] = [], accountIndex = 0): Promise<ExecuteResult> => {
        const msg = OtcMsgBuilder.getConfirmConfigExecute()
        const result = await this.executeContract(msg, memo, funds, accountIndex)

        return result
    }


    /**
     * Queries the OTC contract for the current config.
     * @returns The current config of the contract.
     */
    public queryConfig = async (): Promise<OtcConfig> => {
        const msg = OtcMsgBuilder.getConfigQuery()
        const result: OtcConfig = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the OTC contract for any pending config changes.
     * @returns Any pending config changes along with the current config of the contract.
     */
    public queryPendingConfig = async (): Promise<OtcConfigAndPending> => {
        const msg = OtcMsgBuilder.getPendingConfigQuery()
        const result: OtcConfigAndPending = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the OTC contract for the details of an Escrow with the provided id.
     * @param id The identifier for the Escrow you wish to retrieve.
     * @returns The details of the Escrow.
     * @throws ContractQueryError when no Escrow is found for the given identifier.
     */
    public queryMarketEscrow = async (id: number): Promise<RichEscrowDetails> => {
        try {
            const msg = OtcMsgBuilder.getMarketEscrowQuery(id)
            const result: EscrowDetails = await this.queryContract(msg)

            return await this.getRichEscrowDetails(result)
        } catch (error) {
            const queryError = ChainErrorHelper.getContractQueryError(error, `No Escrow found for the provided id: ${id}.`, SmartContractName.UTILS_CONTRACT)
            throw queryError
        }
    }

    /**
     * Queries the OTC contract for a list of Escrows that do not have a recipient set. Essentially these Escrows are open to anyone
     * who is interested to take up the deal.
     * @param startAfterId An Id of an Escrow. If you are paging through, provide the Id of the last Escrow on the previous page.
     * You can also get this value from the pagination.next_key value on the PaginatedResult of your last call.
     * @param limit The amount of results to return per page. Maxed at 20.
     * @param sortAsc The sort direction.
     * @returns A PagininatedResult with an array of EscrowDetails.
     */
    public queryMarketEscrowList = async (startAfter?: any, limit = 20, sortAsc?: boolean, excludeExpiredDeals = true): Promise<PaginatedResult<EscrowDetails[]>> => {
        if(excludeExpiredDeals) {
            console.log('Fetching Actives only....')
            const msg = OtcMsgBuilder.getMarketEscrowActiveListQuery(startAfter, limit, sortAsc)
            const result: PaginatedResult<EscrowDetails[]> = await this.queryContract(msg)

            return result;
        }
        else {
            const msg = OtcMsgBuilder.getMarketEscrowListQuery(startAfter, limit, sortAsc)
            const result: PaginatedResult<EscrowDetails[]> = await this.queryContract(msg)

            return result;
        }

        //we will release this soon.
        //const richEscrowDetailsList = await this.getRichEscrowDetailsList(result.data)
        //return {data: richEscrowDetailsList, pagination: result.pagination}
    }

    /**
     * Queries the OTC contract for a list of Escrows for the provided pair. The list is paginated and will
     * return results starting with the first Escrow after the startAfterId param, which should be an Escrow Id.
     * @param pair The pair combination to be queried. Eg: ['uatom', 'ukuji'] will query for Escrows that swap uatom for ukuji.
     * @param startAfterId An Id of an Escrow. If you are paging through, provide the Id of the last Escrow on the previous page.
     * You can also get this value from the pagination.next_key value on the PaginatedResult of your last call.
     * @param limit The amount of results to return per page. Maxed at 20.
     * @param sortAsc The sort direction.
     * @returns A listing of Escrows.
     */
    public queryPairsList = async (pair: [string, string], startAfter: any, limit = 20, sortAsc?: boolean, excludeExpiredDeals = true): Promise<PaginatedResult<EscrowDetails[]>> => {
        if(excludeExpiredDeals) {
            console.log('Fetching Actives only....')
            const msg = OtcMsgBuilder.getPairsActiveListQuery(pair, startAfter, limit, sortAsc)
            const result: PaginatedResult<EscrowDetails[]> = await this.queryContract(msg)

            return result;
        }
        else {
            const msg = OtcMsgBuilder.getPairsListQuery(pair, startAfter, limit, sortAsc)
            const result: PaginatedResult<EscrowDetails[]> = await this.queryContract(msg)

            return result
        }

        //we will release this soon.
        //const richEscrowDetailsList = await this.getRichEscrowDetailsList(result.data)
        //return {data: richEscrowDetailsList, pagination: result.pagination}
    }

    /**
     * Queries the OTC contract for a list of Escrows that have been created by the provided creator address.
     * The list is paginated and will return results starting with the first Escrow after the startAfterId param,
     * which should be an Escrow Id.
     * @param creator A wallet address.
     * @param startAfterId An Id of an Escrow. If you are paging through, provide the Id of the last Escrow on the previous page.
     * You can also get this value from the pagination.next_key value on the PaginatedResult of your last call.
     * @param limit The amount of results to return per page. Maxed at 20.
     * @param sortAsc The sort direction.
     * @returns A list of Escrows
     */
    public queryCreatorEscrowList = async (creator: string, startAfterId?: number, limit = 20, sortAsc?: boolean): Promise<PaginatedResult<EscrowDetails[]>> => {
        const msg = OtcMsgBuilder.getCreatorEscrowListQuery(creator, startAfterId, limit, sortAsc)
        const result: PaginatedResult<EscrowDetails[]> = await this.queryContract(msg)

        return result

        //we will release this soon.
        // const richEscrowDetailsList = await this.getRichEscrowDetailsList(result.data)
        // return {data: richEscrowDetailsList, pagination: result.pagination}
    }

    /**
     * Queries the OTC contract for a list of Escrows that have the provided wallet address as a recipient.
     * The list is paginated and will return results starting with the first Escrow after the startAfterId param,
     * which should be an Escrow Id.
     * @param recipient A wallet address.
     * @param startAfterId An Id of an Escrow. If you are paging through, provide the Id of the last Escrow on the previous page.
     * You can also get this value from the pagination.next_key value on the PaginatedResult of your last call.
     * @param limit The amount of results to return per page. Maxed at 20.
     * @param sortAsc The sort direction.
     * @returns A list of Escrows
     */
    public queryRecipientEscrowList = async (recipient: string, startAfterId?: number, limit = 20, sortAsc?: boolean): Promise<PaginatedResult<EscrowDetails[]>> => {
        const msg = OtcMsgBuilder.getRecipientEscrowListQuery(recipient, startAfterId, limit, sortAsc)
        const result: PaginatedResult<EscrowDetails[]> = await this.queryContract(msg)

        return result

        //we will release this soon.
        //const richEscrowDetailsList = await this.getRichEscrowDetailsList(result.data)
        //return {data: richEscrowDetailsList, pagination: result.pagination}
    }

    /**
     * Queries the OTC contract for a distinct list of token pairs, with active Escrows.
     * Once all Escrows within a pair have closed, that pair will no longer appear in the
     * results until at least 1 new Escrow for that pair is active.
     * @returns A list of pairs with open Escrows, including a count of how Escrows are active for the pair.
     */
    public queryPairsCount = async (excludeExpiredDeals = true): Promise<PairCount[]> => {
        if(excludeExpiredDeals) {
            const msg = OtcMsgBuilder.getActivePairsCountQuery()
            const result: { pairs: PairCount[] } = await this.queryContract(msg)

            return result.pairs
        }
        else{
            const msg = OtcMsgBuilder.getPairsCountQuery()
            const result: { pairs: PairCount[] } = await this.queryContract(msg)

            return result.pairs
        }
    }

    /**
     * Returns the underlying Trusted Assets cache that this MessageBroadcaster uses to enrich certain contract response data.
     * The first time the cache is accessed, either via this function call or other functions within this class being called,
     * it will be fetched from our Utils contract. There-after it is cached for efficiency as it is a fairly static list of assets.
     * These assets are the ones we offer to users when creating a new Escrow, and they have been curated and saved on chain.
     * You can also get this same list via the TokenHelper.getTrustedAssets(), which is what we call in the underlying code of this
     * function.
     * @returns A list of trusted assets with their chain properties.
     */
    public getTrustedAssets = async() => {
        await this.fetchTrustedAssetsIfUndefined()
        return this._trustedAssets
    }


    private getRichEscrowDetails = async (escrowDetails:EscrowDetails):Promise<RichEscrowDetails> => {
        return {
            id:escrowDetails.id,
            creator:escrowDetails.creator,
            arbiter:escrowDetails.arbiter,
            createdAt:escrowDetails.created_at,
            description:escrowDetails.description,
            endHeight:escrowDetails.end_height,
            endTime:escrowDetails.end_time,
            recipient:escrowDetails.recipient,
            status:escrowDetails.status,
            title:escrowDetails.title,
            askingPrice: await this.getRichTokenBalance(escrowDetails.asking_price),
            creatorBalance: await this.getRichTokenBalances(escrowDetails.creator_balance),
            recipientBalance:await this.getRichTokenBalances(escrowDetails.recipient_balance)
        }
    }

    private getRichEscrowDetailsList = async (escrowDetailsList:EscrowDetails[]): Promise<RichEscrowDetails[]> => {
        const richEscrowList:RichEscrowDetails[] = []

        for(let i=0; i < escrowDetailsList?.length; i++) {
            const richDetails = await this.getRichEscrowDetails(escrowDetailsList[i])
            richEscrowList.push(richDetails)
        }

        return richEscrowList
    }

    private getRichTokenBalance = async (amountAndDenom:{amount: string, denom: string}):Promise<RichTokenBalance> => {
        await this.fetchTrustedAssetsIfUndefined()
        const tokenDetails = this._trustedAssets.find(ta => ta.transactDenom.toLowerCase() === amountAndDenom.denom.toLowerCase())

        if(tokenDetails) {
            return {
                baseAmount: parseInt(amountAndDenom.amount),
                baseDenom: tokenDetails.baseDenom,
                display: tokenDetails.display,
                name: tokenDetails.name,
                symbol: tokenDetails.symbol,
                symbolPng: tokenDetails.symbolPng,
                symbolSvg: tokenDetails.symbolSvg,
                exponent: tokenDetails.exponent,
                symbolAmount: TokenHelper.getSymbolAmount(parseInt(amountAndDenom.amount), tokenDetails.exponent),
                transactDenom: amountAndDenom.denom
            }
        }
        else {
            return {
                baseAmount: parseInt(amountAndDenom.amount),
                baseDenom: amountAndDenom.denom,
                display: undefined,
                name: undefined,
                symbol: undefined,
                symbolPng: undefined,
                symbolSvg: undefined,
                exponent: undefined,
                symbolAmount: undefined,
                transactDenom: undefined
            }
        }
    }

    private getRichTokenBalances = async (balances:{amount: string, denom: string}[]):Promise<RichTokenBalance[]> => {
        const richBalances:RichTokenBalance[] = []
        for(let i=0; i < balances.length; i++){
            const item = balances[i]
            const richItem = await this.getRichTokenBalance(item)
            richBalances.push(richItem)
        }

        return richBalances
    }

    private fetchTrustedAssetsIfUndefined = async() => {
        if (!this._trustedAssets) {
            this._trustedAssets = await TokenHelper.getTrustedAssets(this._utilsContract)
        }
    }

}