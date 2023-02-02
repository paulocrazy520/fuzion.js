import {InvalidParameterError} from "../errors/invalid-paramater-error";
import {PaginatedResult} from "../../core/types/paginated-result";
import {TokenDistribution} from "../contracts/fuzion-utilities/utilities-message-types";
import {UtilitiesMessageBroadcaster} from "../contracts/fuzion-utilities/utilities-message-broadcaster";
import {TokenProperties} from "../types/token-types";
import {Formatter} from "../../core/utils/formatter";
import {TerminalLogger} from "./terminal-logger";

export class TokenHelper {

    private static _trustedAssetCache:TokenProperties[] = undefined

    /**
     * Converts a token balance from a base amount (eg: uKuji) to a symbol amount (eg KUJI) using the supplied
     * exponent value. Base amounts and base denoms are used at a contract level, whereas symbol amounts are
     * usually what we show to the user at a UI level.
     * @param baseAmount The balance in a uToken denom.
     * @param exponent The exponent of the token that should be used to convert the base amount to a symbol amount.
     * @returns The converted symbol amount. This amount is a smaller value than the passed in base amount.
     */
    public static getSymbolAmount(baseAmount: number, exponent: number): number {
        if(!exponent || exponent < 0) {
            throw new InvalidParameterError(`The supplied exponent value of ${exponent} is invalid.`)
        }

        return baseAmount / Math.pow(10, exponent)
    }

    /**
     * Queries the Total Supply query on the Utils Contract, pages through to the end, and flattens the
     * results into a TokenProperties[].
     *
     * IMPORTANT NOTE:
     * These results are not cached within the TokenHelper and calling
     * this function will always result in querying the chain and paging through the results until there
     * are no pages left.
     * @param utilsContract A MessageBroadcaster to be used in querying the Utils Contract.
     * @returns A list of tokens with their chain properties.
     */
    public static getTokenDistributions = async (utilsContract: UtilitiesMessageBroadcaster): Promise<TokenProperties[]> => {
        const tokenData: PaginatedResult<TokenDistribution[]> = await utilsContract.queryAssetListByTotalSupply()
        let allTokens = tokenData.data
        let nextKey = tokenData.pagination.next_key

        while (nextKey) {
            const moreTokenData: PaginatedResult<TokenDistribution[]> = await utilsContract.queryAssetListByTotalSupply(nextKey)

            if (moreTokenData.data) {
                allTokens = allTokens.concat(moreTokenData.data)
            }

            nextKey = moreTokenData.pagination.next_key
        }

        TerminalLogger.log(`Paging completed for utilsContract.queryAssetListByTotalSupply(). ${allTokens.length} items retrieved`)

        return this.getTokenProperties(allTokens)
    }

    /**
     * Queries the Curated Assets query on the Utils Contract, pages through to the end, and flattens the
     * results into a TokenProperties[].
     *
     * IMPORTANT NOTE:
     * These results are not cached within the TokenHelper and calling
     * this function will always result in querying the chain and paging through the results until there
     * are no pages left.
     * @param utilsContract A MessageBroadcaster to be used in querying the Utils Contract.
     * @returns A list of tokens with their chain properties.
     */
    public static getTrustedAssets = async (utilsContract: UtilitiesMessageBroadcaster): Promise<TokenProperties[]> => {
        if (this._trustedAssetCache?.length > 0) {
            TerminalLogger.log('Returning cached assets...')
            return this._trustedAssetCache
        } else {
            TerminalLogger.log('Assets cache is empty, fetching from the chain...')
            const tokenData: PaginatedResult<TokenDistribution[]> = await utilsContract.queryCuratedAssetList(undefined, 50)

            let allTokens = tokenData.data
            let nextKey = tokenData.pagination.next_key

            let pageCount = 1
            while (nextKey) {
                const moreTokenData: PaginatedResult<TokenDistribution[]> = await utilsContract.queryCuratedAssetList(nextKey)

                if (moreTokenData.data) {
                    allTokens = allTokens.concat(moreTokenData.data)
                }

                nextKey = moreTokenData.pagination.next_key
                pageCount++
            }

            TerminalLogger.log(`Paging completed for utilsContract.queryCuratedAssetList(). ${allTokens.length} items retrieved from ${pageCount} pages`)

            const tokenProps = this.getTokenProperties(allTokens)
            this._trustedAssetCache = tokenProps?.sort(this.compareSymbol)
            return this._trustedAssetCache
        }
    }

    private static compareSymbol(item1:TokenProperties, item2:TokenProperties ):number {
        if ( item1.symbol.toUpperCase() < item2.symbol.toUpperCase() ){
            return -1;
        }
        if ( item1.symbol.toUpperCase() > item2.symbol.toUpperCase() ){
            return 1;
        }
        return 0;
    }

    private static getTokenProperties = (tokenDistributions: TokenDistribution[]): TokenProperties[] => {
        const allTokenProps: TokenProperties[] = []

        //Loop the TokenDistribution items and then internally loop the ChainAssets for each item.
        tokenDistributions.forEach(function (tokenDist) {

            TerminalLogger.log('Enriching token properties...')
            TerminalLogger.log(`Items processed: ${allTokenProps.length}. Current item in loop:`)
            TerminalLogger.logPrettyJson(tokenDist)

            if (tokenDist.chain_and_asset && tokenDist.chain_and_asset.length > 0) {

                //Loop the ChainAssets for this TokenDistribution item to extract
                //token information for each token, per chain it exists on.
                tokenDist.chain_and_asset.forEach(function (chainAsset) {

                    //get the exponent by finding the denom_units item whose denom matches
                    //the display denom for this ChainAsset.
                    const symbolExponent = chainAsset.asset.denom_units.find(a => a.denom.toLowerCase() === chainAsset.asset.display.toLowerCase()).exponent

                    const tokenProp: TokenProperties = {
                        transactDenom: tokenDist.denom,
                        chainName: chainAsset.chain_name,
                        display: chainAsset.asset.display,
                        name: chainAsset.asset.name,
                        symbol: chainAsset.asset.symbol,
                        symbolPng: chainAsset.asset.logo_URIs.png,
                        symbolSvg: chainAsset.asset.logo_URIs.svg,
                        baseDenom: chainAsset.asset.base,
                        exponent: symbolExponent
                    }

                    TerminalLogger.logPrettyJson('Pushing with props')
                    allTokenProps.push(tokenProp)
                })
            } else {
                const tokenProp: TokenProperties = {
                    transactDenom: tokenDist.denom,
                    chainName: 'Unavailable',
                    display: null,
                    name: null,
                    symbol: null,
                    symbolPng: null,
                    symbolSvg: null,
                    baseDenom: null,
                    exponent: null
                }

                TerminalLogger.logPrettyJson(tokenProp)
                TerminalLogger.log('Pushing without props')
                allTokenProps.push(tokenProp)
            }
        })

        TerminalLogger.log(`Processing complete. Total tokens outputted: ${allTokenProps.length}`)
        return allTokenProps
    }
}