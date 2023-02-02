import {DirectSecp256k1HdWallet, OfflineSigner} from "@cosmjs/proto-signing";
import {WalletHelper} from "./wallet-helper";
import {ContractHelper} from './contract-helper'
import {OtcMessageBroadcaster} from "../contracts/fuzion-otc/otc-message-broadcaster";
import {ReactorMessageBroadcaster} from "../contracts/fuzion-reactor/reactor-message-broadcaster";
import {UtilitiesMessageBroadcaster} from "../contracts/fuzion-utilities/utilities-message-broadcaster";
import { GasPrice } from "@cosmjs/stargate";
import {WalletTokenBalance} from "../types/token-types";
import {Network} from "../enums/network"
import {UtilitiesFuzionChainConfig} from "../contracts/fuzion-utilities/utilities-message-types";
import {FuzionConfigClient} from "./fuzion-config-client";
import {SmartContractName} from "../enums/smart-contract-name"
import {RPC_ENDPOINT, DEFAULT_GAS_PRICE} from "../constants/constants"
import {TerminalLogger} from "./terminal-logger";

export { GasPrice } from "@cosmjs/stargate";

/**
 * Blockchain client class that provides functions for all queries and message executes
 * on smart contracts created by the Fuzion protocol team.
 *
 * There is a MessageBroadcaster property per contract, which wraps these calls into a
 * convenient set of functions that abstract away the need to know the message structures
 * expected by the individual smart contracts. These MessageBroadcaster properties do need
 * to be initialised up front, before consuming them. Eg: initOtcContract().
 *
 * Construct a new instance of this class using one of the 2 factory functions : fromMnemonic() and fromWallet().
 */
export class FuzionClient {
    readonly wallet: OfflineSigner
    readonly gasPrice: GasPrice

    protected _contractHelper: ContractHelper

    private _otcContract: OtcMessageBroadcaster
    private _reactorContract: ReactorMessageBroadcaster
    private _utilsContract: UtilitiesMessageBroadcaster

    private _chainConfig:UtilitiesFuzionChainConfig


    /**
     * A smart contract wrapper that provides functions for queries and message executes.
     * This will auto-initialise the first time it is accessed, if it has not already been
     * initialised via a call to initOtcContract().
     */
    get otcContract(): OtcMessageBroadcaster {
        if(!this._otcContract) {
            if(!this.chainConfig) {
                throw new Error('No chain configuration has been loaded. Please first load the configuration for this FuzionClient instance and try again. You can load the chain config by executing the fetchConfig() function.')
            }

            const address = this.getContractAddress(SmartContractName.OTC_CONTRACT)
            this.initOtcContract(address)
        }

        return this._otcContract
    }

    /**
     * A smart contract wrapper that provides functions for queries and message executes.
     * This will auto-initialise the first time it is accessed, if it has not already been
     * initialised via a call to initReactorContract().
     */
    get reactorContract(): ReactorMessageBroadcaster {
        if(!this._reactorContract) {
            if(!this.chainConfig) {
                throw new Error('No chain configuration has been loaded. Please first load the configuration for this FuzionClient instance and try again. You can load the chain config by executing the fetchConfig() function.')
            }

            const address = this.getContractAddress(SmartContractName.REACTOR_SWAP_CONTRACT)
            this.initReactorContract(address)
        }

        return this._reactorContract
    }

    /**
     * A smart contract wrapper that provides functions for queries and message executes.
     * This will auto-initialise the first time it is accessed, if it has not already been
     * initialised via a call to initUtilsContract().
     */
    get utilsContract(): UtilitiesMessageBroadcaster {
        if(!this._utilsContract) {
            if(!this.chainConfig) {
                throw new Error('No chain configuration has been loaded. Please first load the configuration for this FuzionClient instance and try again. You can load the chain config by executing the fetchConfig() function.')
            }

            const address = this.getContractAddress(SmartContractName.UTILS_CONTRACT)
            this.initUtilsContract(address)
        }

        return this._utilsContract
    }


    /**
     * The chain configuration that is used when interacting with any smart contracts.
     */
    get chainConfig():UtilitiesFuzionChainConfig {
        return this._chainConfig
    }


    /**
     * Constructs a FuzionClient and configures it against the passed in wallet and RPC Endpoint.
     * @param wallet The wallet that will be used in all message executes.
     * @param gasPrice The Gas Price to be used with contract executes.
     */
    private constructor(wallet: OfflineSigner, gasPrice?: GasPrice) {
        this.wallet = wallet
        this.gasPrice = gasPrice

        try {
            console.log(`Initialising FuzionClient from SDK version ${process.env.npm_package_version}`)
        }
        catch (error) {
            console.log('Failed to retrieve version of Fuzion.js package.')
        }
    }


    /**
     * Initialises the otcContract property of the FuzionClient against the passed in contract address.
     * This object can then be used to run any queries and message executes on the contract.
     * It does not initialise a contract instance on the chain.
     * @param contractAddress The address of the OTC smart contract.
     */
    initOtcContract(contractAddress: string) {
        TerminalLogger.log(`Initialising OTC Contract with address ${contractAddress}`)
        this._otcContract = new OtcMessageBroadcaster(contractAddress, this.wallet, this._chainConfig.chain_rpc_url, this._contractHelper, this.utilsContract)
    }

    /**
     * Initialises the reactorContract property of the FuzionClient against the passed in contract address.
     * This object can then be used to run any queries and message executes on the contract.
     * It does not initialise a contract instance on the chain.
     * @param contractAddress The address of the Reactor smart contract.
     */
    initReactorContract(contractAddress: string) {
        TerminalLogger.log(`Initialising Reactor Contract with address ${contractAddress}`)
        this._reactorContract = new ReactorMessageBroadcaster(contractAddress, this.wallet, this._chainConfig.chain_rpc_url, this._contractHelper)
    }

    /**
     * Initialises the utilsContract property of the FuzionClient against the passed in contract address.
     * This object can then be used to run any queries and message executes on the contract.
     * It does not initialise a contract instance on the chain.
     * @param contractAddress The address of the Utils smart contract.
     */
    initUtilsContract(contractAddress: string) {
        TerminalLogger.log(`Initialising Utils Contract with address ${contractAddress}`)
        this._utilsContract = new UtilitiesMessageBroadcaster(contractAddress, this.wallet, this._chainConfig.chain_rpc_url, this._contractHelper)
    }


    /**
     * Factory function for constructing a new FuzionClient, using a wallet mnemonic.
     * @param mnemonic The seed phrase of the wallet you wish to be used in message executes.
     * @param chainPrefix The prefix of the chain. Defaulted to 'kujira' since this is our home chain.
     * @param gasPrice The Gas Price to be used with contract executes.
     * @returns A new FuzionClient.
     */
    public static fromMnemonic = async (mnemonic: string, gasPrice = GasPrice.fromString(DEFAULT_GAS_PRICE), chainPrefix = 'kujira'): Promise<FuzionClient> => {
        const walletInst = await WalletHelper.getWalletFromMnemonic(mnemonic, chainPrefix)
        return new this(walletInst, gasPrice)
    }

    /**
     * Factory function for constructing a new FuzionClient, using a wallet mnemonic.
     * @param offlineSigner The offlineSigner from a wallet.
     * @param chainConfig The chain config to use for all contract interactions.
     * @param gasPrice The Gas Price to be used with contract executes.
     * @returns A new FuzionClient.
     */
    public static fromOfflineSigner = (offlineSigner: OfflineSigner, chainConfig:UtilitiesFuzionChainConfig, gasPrice = GasPrice.fromString(DEFAULT_GAS_PRICE)): FuzionClient => {
        const client = new this(offlineSigner, gasPrice)
        client.loadConfig(chainConfig)

        return client
    }

    /**
     * Factory function for constructing a new FuzionClient, using a wallet.
     * @param wallet The wallet you wish to be used in message executes.
     * @param gasPrice The Gas Price to be used with contract executes.
     * @returns A new FuzionClient.
     */
    public static fromWallet = (wallet: DirectSecp256k1HdWallet, gasPrice = GasPrice.fromString(DEFAULT_GAS_PRICE)): FuzionClient => {
        return new this(wallet, gasPrice)
    }


    /**
     * Queries the chain for the token balances of a wallet address.
     * @param walletAddress The address of the wallet you wish to fetch balances for.
     * @returns All balances for the wallet, along with token properties per token.
     */
    public getWalletBalances = async(walletAddress:string):Promise<WalletTokenBalance[]> => {
        if(!this._utilsContract) {
            if(!this.chainConfig) {
                throw new Error('No chain configuration has been loaded. Please first load the configuration for this FuzionClient instance and try again. You can load the chain config by executing the fetchConfig() function.')
            }

            const address = this.getContractAddress(SmartContractName.UTILS_CONTRACT)
            this.initUtilsContract(address)
        }

        return await WalletHelper.getWalletBalances(walletAddress, this._utilsContract, this.chainConfig.chain_lcd_url)
    }

    /**
     * Loads in a chain config, to be used in all contract interactions.
     * @param chainConfig The chain config to initialise all contract wrappers with.
     */
    public loadConfig = (chainConfig:UtilitiesFuzionChainConfig) => {
        if(this._chainConfig) {
            throw new Error('The config for this client has already been set. Please destroy this client and create a new one if you wish to use new configuration.')
        }

        this._chainConfig = chainConfig
        this._contractHelper = new ContractHelper(this._chainConfig.chain_rpc_url, this.gasPrice)
    }

    public fetchConfig = async (network:Network, rpcEndpoint = RPC_ENDPOINT) => {
        if(this._chainConfig) {
            throw new Error('The config for this client has already been set. Please destroy this client and create a new one if you wish to use new configuration.')
        }

        const fuzionChainConfigClient = new FuzionConfigClient(rpcEndpoint)
        const fuzionChainConfig = await fuzionChainConfigClient.getFuzionChainConfig()

        this._chainConfig = fuzionChainConfig.data.find((config) => config.chain_config.network_type.toLowerCase() === network.toLowerCase())?.chain_config
        this._contractHelper = new ContractHelper(this._chainConfig.chain_rpc_url, this.gasPrice)
    }

    private getContractAddress = (contractName:string):string => {
        const contractDetails = this._chainConfig.chain_contracts.find(c => c.contract_name.toLowerCase() === contractName.toLowerCase())
        if(contractDetails) {
            return contractDetails.contract_address
        }

        throw new Error(`No contract with the name ${contractName} was found in the loaded chain config.`)
    }

    /**
     * Enables or disables the internal logging within the SDK.
     * @param enabled Whether to enable or disable logging.
     */
    public enableLogging = (enabled:boolean) => {
        TerminalLogger.enabled = enabled
    }
}