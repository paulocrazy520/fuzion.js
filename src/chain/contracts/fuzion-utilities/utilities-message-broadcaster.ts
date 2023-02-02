import {OfflineSigner} from "@cosmjs/proto-signing";
import {ContractHelper} from "../../utils/contract-helper";
import {MessageBroadcaster} from "../base/message-broadcaster";
import {UtilitiesMessageBuilder} from "./utilities-message-builder";
import {Chain, AssetList, IBCInfo} from '@chain-registry/types';
import {
    ChainOverview,
    UtilitiesFuzionChainConfigResponse,
    UtilitiesIBCDenom,
    ChainAsset, TokenDistribution
} from "./utilities-message-types";
import {PaginatedResult} from "../../../core/types/paginated-result";


export class UtilitiesMessageBroadcaster extends MessageBroadcaster {

    constructor(contractAddress:string, wallet:OfflineSigner, rpcEndpoint:string, contractHelper:ContractHelper) {
        super(contractAddress, wallet, rpcEndpoint, contractHelper)
    }

    /**
     * Queries the Utilities Contract for the current admin wallet.
     * @returns The address of the admin wallet.
     */
    public queryAdmin = async (): Promise<string> => {
        const msg = UtilitiesMessageBuilder.getAdminQuery()
        const result: {admin:string} = await this.queryContract(msg)

        return result.admin
    }

    /**
     * Queries the Utilities Contract for information on a single chain. This information
     * comes from the Cosmos Chain Registry.
     * @param chainName The name of the chain you wish to query info for.
     * @returns A pretty extensive result of chain properties.
     */
    public queryChain = async (chainName: string): Promise<Chain> => {
        const msg = UtilitiesMessageBuilder.getChainQuery(chainName)
        const result:Chain = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the Utilities Contract for information on multiple chains. This information comes from
     * the Cosmos Chain Registry. This list is paginated and will return results starting with the first
     * chain after the startAfter param, which should be a chain_name.
     * @param startAfter A name of a chain. If you are paging through, provide the chain_name of the last Chain on the previous page.
     * You can also get this value from the pagination.next_key value on the PaginatedResult of your last call.
     * @param limit The amount of results to return per page.
     * @returns A PaginatedResult of ChainOverviews.
     */
    public queryChainList = async (startAfter?: string, limit?: number): Promise<PaginatedResult<ChainOverview[]>> => {
        const msg = UtilitiesMessageBuilder.getChainListQuery(startAfter, limit)
        const result:PaginatedResult<ChainOverview[]> = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the Utilities Contract for properties of an asset on a given chain.
     * @param symbol The ticker symbol of the asset you want to query for.
     * @param chainName The name of the chain that the asset is on.
     * @returns Asset properties.
     */
    public queryAsset = async (symbol: string, chainName: string): Promise<AssetList> => {
        const msg = UtilitiesMessageBuilder.getAssetQuery(symbol.toUpperCase(), chainName)
        const result:AssetList = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the Utilities Contract for properties of multiple assets. The list is paginated and will
     * return results starting with the first asset after the startAfter param, which should be in the format [symbol,chain name].
     * @param startAfter [symbol,chain name] why symbol is a token ticker and chain_name is the name of a chain.
     * @param limit The amount of results to return per page.
     * @returns A list of assets and their properties.
     */
    public queryAssetList = async (startAfter?: [string, string], limit?: number): Promise<PaginatedResult<[string[], ChainAsset]>> => {
        const msg = UtilitiesMessageBuilder.getAssetListQuery(startAfter, limit)
        const result:PaginatedResult<[string[], ChainAsset]> = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the Utilities Contract for properties of multiple, curated assets. The list is paginated and will
     * return results starting with the first asset after the startAfter param, which should be in the format [symbol,chain name].
     * @param startAfter [symbol,chain name] why symbol is a token ticker and chain_name is the name of a chain.
     * @param limit The amount of results to return per page.
     * @returns A list of assets and their properties.
     */
    public queryCuratedAssetList = async (startAfter?: [string, string], limit?: number): Promise<PaginatedResult<TokenDistribution[]>> => {
        const msg = UtilitiesMessageBuilder.getCuratedAssetList(startAfter, limit)
        const result:PaginatedResult<TokenDistribution[]> = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the Utilities Contract for information on a specific AssetList, using its base as
     * a filter. The results will include information from any chains the token exists on. The list is paginated and will
     * return results starting with the first asset after the startAfter param, which should be in the format [symbol,chain name].
     * @param base The base token ticker symbol, eg: ukuji.
     * @param startAfter [symbol,chain name] why symbol is a token ticker and chain_name is the name of a chain.
     * @param limit The amount of results to return per page.
     * @returns The properties of the given asset.
     */
    public queryAssetListByBase = async (base: string, startAfter?: [string, string], limit?: number): Promise<PaginatedResult<[string[], ChainAsset]>> => {
        const msg = UtilitiesMessageBuilder.getAssetListByBaseQuery(base, startAfter, limit)
        const result:PaginatedResult<[string[], ChainAsset]> = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the Utilities Contract for information on a specific AssetList, using its display name as
     * a filter. The results will include information from any chains the token exists on. The list is paginated and will
     * return results starting with the first asset after the startAfter param, which should be in the format [symbol,chain name].
     * @param display The display name that is used for the asset.
     * @param startAfter [symbol,chain name] why symbol is a token ticker and chain_name is the name of a chain.
     * @param limit The amount of results to return per page.
     * @returns The properties of the given asset.
     */
    public queryAssetListByDisplay = async (display: string, startAfter?: [string, string], limit?: number): Promise<PaginatedResult<[string[], ChainAsset]>> => {
        const msg = UtilitiesMessageBuilder.getAssetListByDisplayQuery(display, startAfter, limit)
        const result:PaginatedResult<[string[], ChainAsset]> = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the Utilities Contract for information on a specific AssetList, using its ticker symbol as
     * a filter. The results will include information from any chains the token exists on. The list is paginated and will
     * return results starting with the first asset after the startAfter param, which should be in the format [symbol,chain name].
     * @param symbol The ticker symbol of the asset.
     * @param startAfter [symbol,chain name] why symbol is a token ticker and chain_name is the name of a chain.
     * @param limit The amount of results to return per page.
     * @returns The properties of the given asset.
     */
    public queryAssetListBySymbol = async (symbol: string, startAfter?: [string, string], limit?: number): Promise<PaginatedResult<[string[], ChainAsset]>> => {
        const msg = UtilitiesMessageBuilder.getAssetListBySymbolQuery(symbol.toUpperCase(), startAfter, limit)
        const result:PaginatedResult<[string[], ChainAsset]> = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the Utilities Contract for information on a specific AssetList, as its IBC Hash as a filter. The results will include
     * information from any chains the token exists on. The list is paginated and will return results starting with the first AssetList
     * after the startAfter param, which should be in the format [symbol,chain name].
     * @param hash An IBC Hash.
     * @param startAfter [symbol,chain name] why symbol is a token ticker and chain_name is the name of a chain.
     * @param limit The amount of results to return per page.
     * @returns
     */
    public queryAssetListByIbcHash = async (hash: string, startAfter?: [string, string], limit?: number): Promise<PaginatedResult<[string[], ChainAsset]>> => {
        const msg = UtilitiesMessageBuilder.getAssetListByIbcHashQuery(hash, startAfter, limit)
        const result:PaginatedResult<[string[], ChainAsset]> = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the Utilities Contract for
     * @param path
     * @param baseDenom
     * @param startAfter
     * @param limit The amount of results to return per page.
     * @returns
     */
    public queryAssetListByIbcPathAndBaseDenom = async (path:string, baseDenom: string, startAfter?: [string, string], limit?: number): Promise<PaginatedResult<[string[], ChainAsset]>> => {
        const msg = UtilitiesMessageBuilder.getAssetListByIbcPathAndBaseDenomQuery(path, baseDenom)
        const result:PaginatedResult<[string[], ChainAsset]> = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the Utilities Contract for information on a specific asset, using all denoms of the Chain Total Supply.
     * The results will include information from any chains the token exists on.
     * @param startAfter //todo:need to confirm what value to use here.
     * @param limit The amount of results to return per page.
     * @returns The properties of the given asset.
     */
     public queryAssetListByTotalSupply = async (startAfter?: [string, string], limit?: number): Promise<PaginatedResult<TokenDistribution[]>> => {
        const msg = UtilitiesMessageBuilder.getAssetListbyTotalSupplyQuery(startAfter, limit)
        const result:PaginatedResult<TokenDistribution[]> = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the Utilities Contract for IBC data relating to 2 Cosmos chains.
     * @param chain1 The name of a chain as per the Cosmos Chain Registry
     * @param chain2 The name of a chain as per the Cosmos Chain Registry
     * @returns IBC data for both chains.
     */
    public queryIbcPath = async (chain1:string, chain2: string): Promise<IBCInfo> => {
        const msg = UtilitiesMessageBuilder.getIbcPathQuery(chain1, chain2)
        const result:IBCInfo = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the Utilities Contract for
     * @param startAfter
     * @param limit The amount of results to return per page.
     * @returns
     */
    public queryIbcPathList = async (startAfter?: [string, string], limit?: number): Promise<PaginatedResult<IBCInfo[]>> => {
        const msg = UtilitiesMessageBuilder.getIbcPathListQuery(startAfter, limit)
        const result:PaginatedResult<IBCInfo[]> = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the Utilities Contract for
     * @param startAfter
     * @param limit The amount of results to return per page.
     * @returns
     */
    public queryIbcPathDenomsList = async (startAfter?: string, limit?: number): Promise<PaginatedResult<UtilitiesIBCDenom[]>> => {
        const msg = UtilitiesMessageBuilder.getIbcPathDenomsQuery(startAfter, limit)
        const result:PaginatedResult<UtilitiesIBCDenom[]> = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the Utilities Contract for Fuzion Chain Config
     * @param chain_name The name of the chain you wish to query for. Currently, case-sensitive.
     * @param network_type The network type, example Mainnet/Testnet/Devnet (but not limited to these 3). Currently, case-sensitive.
     * @returns
     */
     public queryFuzionChainConfig = async (chain_name:string, network_type: string): Promise<UtilitiesFuzionChainConfigResponse> => {
        const msg = UtilitiesMessageBuilder.getFuzionChainConfigQuery(chain_name, network_type)
        const result:UtilitiesFuzionChainConfigResponse = await this.queryContract(msg)

        return result
    }

    /**
     * Queries the Utilities Contract for
     * @param startAfter
     * @param limit The amount of results to return per page.
     * @returns
     */
    public queryFuzionChainConfigList = async (startAfter?: [string, string], limit?: number): Promise<PaginatedResult<UtilitiesFuzionChainConfigResponse[]>> => {
        const msg = UtilitiesMessageBuilder.getFuzionChainConfigListQuery(startAfter, limit)
        const result:PaginatedResult<UtilitiesFuzionChainConfigResponse[]> = await this.queryContract(msg)

        return result
    }    
}