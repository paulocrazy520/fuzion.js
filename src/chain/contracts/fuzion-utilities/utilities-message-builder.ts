

export class UtilitiesMessageBuilder {

    //query messages
    public static getAdminQuery = (): Record<string, unknown> => {
        const msg = {
            admin: {}
        }

        return msg
    }

    public static getChainQuery = (chainName: string): Record<string, unknown> => {
        const msg = {
            chain: {
                chain_name: chainName
            }
        }

        return msg
    }

    public static getChainListQuery = (startAfter: string, limit: number): Record<string, unknown> => {
        const msg = {
            list_chains: {
                start_after: startAfter,
                limit: limit
            }
        }

        return msg
    }

    public static getAssetQuery = (symbol: string, chainName: string): Record<string, unknown> => {
        const msg = {
            asset: {
                symbol: symbol,
                chain_name: chainName
            }
        }

        return msg
    }

    public static getCuratedAssetList = (startAfter?: [string, string], limit?: number): Record<string, unknown> => {
        const msg = {
            list_asset_by_curated_denom:
                {
                    start_after: startAfter,
                    limit: limit
                }
        }

        return msg
    }

    public static getAssetListQuery = (startAfter?: [string, string], limit?: number): Record<string, unknown> => {
        const msg = {
            list_assets: {
                start_after: startAfter,
                limit: limit
            }
        }

        return msg
    }

    public static getAssetListByBaseQuery = (base: string, startAfter?: [string, string], limit?: number): Record<string, unknown> => {
        const msg = {
            list_asset_by_base: {
                base: base,
                start_after: startAfter,
                limit: limit
            }
        }

        return msg
    }

    public static getAssetListByDisplayQuery = (display: string, startAfter?: [string, string], limit?: number): Record<string, unknown> => {
        const msg = {
            list_asset_by_display: {
                display: display,
                start_after: startAfter,
                limit: limit
            }
        }

        return msg
    }

    public static getAssetListBySymbolQuery = (symbol: string, startAfter?: [string, string], limit?: number): Record<string, unknown> => {
        const msg = {
            list_asset_by_symbol: {
                symbol: symbol,
                start_after: startAfter,
                limit: limit
            }
        }

        return msg
    }

    public static getAssetListByIbcHashQuery = (hash: string, startAfter?: [string, string], limit?: number): Record<string, unknown> => {
        const msg = {
            list_asset_by_ibc_hash: {
                hash: hash,
                start_after: startAfter,
                limit: limit
            }
        }

        return msg
    }

    public static getAssetListByIbcPathAndBaseDenomQuery = (path:string, baseDenom: string): Record<string, unknown> => {
        const msg = {
            list_asset_by_ibc_path_and_base_denom: {
                path: path,
                base_denom: baseDenom
            }
        }

        return msg
    }

    public static getAssetListbyTotalSupplyQuery = (startAfter?: [string, string], limit?: number): Record<string, unknown> => {
        const msg = {
            list_asset_by_total_supply: {
                start_after: startAfter,
                limit: limit
            }
        }

        return msg
    }    

    public static getIbcPathQuery = (chain1:string, chain2: string): Record<string, unknown> => {
        const msg = {
            ibc_path: {
                chain_1: chain1,
                chain_2: chain2
            }
        }

        return msg
    }

    public static getIbcPathListQuery = (startAfter?: [string, string], limit?: number): Record<string, unknown> => {
        const msg = {
            list_ibc_paths: {
                start_after: startAfter,
                limit: limit
            }
        }

        return msg
    }

    public static getIbcPathDenomsQuery = (startAfter?: string, limit?: number): Record<string, unknown> => {
        const msg = {
            list_ibc_path_denoms: {
                start_after: startAfter,
                limit: limit
            }
        }

        return msg
    }

    public static getFuzionChainConfigQuery = (chain_name:string, network_type: string): Record<string, unknown> => {
        const msg = {
            fuzion_chain_config: {
                chain_name: chain_name,
                network_type: network_type
            }
        }

        return msg
    }

    public static getFuzionChainConfigListQuery = (startAfter?: [string, string], limit?: number): Record<string, unknown> => {
        const msg = {
            list_fuzion_chain_config: {
                start_after: startAfter,
                limit: limit
            }
        }

        return msg
    }
    
}