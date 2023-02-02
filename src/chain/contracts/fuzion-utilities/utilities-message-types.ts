import {AssetList, Asset, Chain} from '@chain-registry/types';

export type UtilitiesIBCDenom = {
    hash: string,
    path: string,
    base_denom: string,
}

export type UtilitiesFuzionContractsConfig = {
    contract_name: string,
    contract_address: string,
}

export type UtilitiesFuzionChainConfig = {
    chain_name: string,
    chain_display_name: string,
    chain_id: string,
    chain_lcd_url: string,
    chain_rpc_url: string,
    connect_type: string,
    network_type: string,
    chain_contracts: UtilitiesFuzionContractsConfig[],
}

export type UtilitiesFuzionChainConfigResponse = {
    chain_config: UtilitiesFuzionChainConfig,
    chain_info: Chain,
}

/**
 * Represents a list of assets on a chain.
 * @property chain_info A chain-registry object representing a chain.
 * @property asset_list A chain-registry object representing
 */
export type ChainOverview = {
    chain_info: Chain,
    asset_list: AssetList
}

/**
 * Represents an asset on a single chain.
 * @property chain_name The name of the chain.
 * @property asset A chain-registry object representing an asset.
 */
export type ChainAsset = {
    chain_name: string,
    asset: Asset
}

/**
 * Represents the chains that a token may exist on.
 * @property denom The base denomination of the token.
 * @property chain_and_asset An array representing all the chains that the token exists on.
 */
export type TokenDistribution = {
    denom:string,
    chain_and_asset : ChainAsset[]
}