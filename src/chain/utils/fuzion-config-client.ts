import {ContractHelper} from './contract-helper'
import {UtilitiesMessageBroadcaster} from '../contracts/fuzion-utilities/utilities-message-broadcaster'
import {RPC_ENDPOINT, UTILS_CONTRACT_ADDRESS} from '../constants/constants'

/**
 * The Fuzion Config Client provides access to configuration used throughout the Fuzion Protoocol
 */
export class FuzionConfigClient {
    private _utilsContract: UtilitiesMessageBroadcaster
    private _rpcEndpoint:string

    protected _contractHelper: ContractHelper
    /**
     * Constructs a FuzionClient and configures it against the passed in wallet and RPC Endpoint.
     */
    constructor(rpcEndpoint = RPC_ENDPOINT) {
        this._contractHelper = new ContractHelper(rpcEndpoint)
        this._rpcEndpoint = rpcEndpoint
    }

    /**
     * Gets the Fuzion Chain Config from the default rpc endpoint and default config contract address.
     */
    getFuzionChainConfig(utilsContractAddress= UTILS_CONTRACT_ADDRESS) {
        this._utilsContract = new UtilitiesMessageBroadcaster(utilsContractAddress, undefined, this._rpcEndpoint, this._contractHelper)
        return this._utilsContract.queryFuzionChainConfigList()
    }
}