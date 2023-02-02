import {AccountData, DirectSecp256k1HdWallet, OfflineSigner} from "@cosmjs/proto-signing"
import {WalletTokenBalance, WalletBalance, TokenProperties} from "../types/token-types"
import {UtilitiesMessageBroadcaster} from "../contracts/fuzion-utilities/utilities-message-broadcaster"
import fetch from "isomorphic-fetch"
import {TokenHelper} from "./token-helper"
import {BANK_BALANCE_QUERY_PATH} from '../constants/constants'
import {ChainApiError} from "../errors/chain-api-error"
import {Path} from "../../core/utils/path";
import {TerminalLogger} from "./terminal-logger";

type BankBalanceResult = {
    height: string,
    result: WalletBalance[]
}

export class WalletHelper {

    public static getWalletFromMnemonic = async (mnemonic: string, prefix: string): Promise<DirectSecp256k1HdWallet> => {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {prefix: prefix})
        return wallet
    }

    public static getWalletFromOfflineSigner = async (offlineSigner: OfflineSigner): Promise<readonly AccountData[]> => {
        const wallet = await offlineSigner.getAccounts()
        return wallet
    }

    //todo: can denom units array from utils contract ever have more than 2? If so, how do we deal with that?
    // "denom_units": [
    //     {
    //         "denom": "uatom",
    //         "exponent": 0
    //     },
    //     {
    //         "denom": "atom",
    //         "exponent": 6
    //     }
    // ],
    public static getWalletBalances = async (walletAddress: string, utilsContract: UtilitiesMessageBroadcaster, lcdUrl: string, chainName = 'kujira'): Promise<WalletTokenBalance[]> => {
        const bankBalanceQueryUrl = Path.join(lcdUrl, BANK_BALANCE_QUERY_PATH)

        const balanceResult = await fetch(bankBalanceQueryUrl.concat(walletAddress))
            .then((resp: any) => resp.json())
            .then((ts: any): BankBalanceResult => {
                if (ts.error) {
                    const error = new ChainApiError('An error was encountered querying the chain api for wallet balances. See innerError for original error message.')
                    error.innerError = ts.error
                    throw error
                }

                return ts
            })

        TerminalLogger.log(`Balances retrieved...`)
        TerminalLogger.logPrettyJson(balanceResult)

        const tokenBalances = await this.getTokenBalances(balanceResult.result, utilsContract)
        const sortedBalances = tokenBalances?.filter(t => t.exponent != null)?.sort(this.compareSymbol)

        return sortedBalances
    }

    private static compareSymbol(item1:WalletTokenBalance, item2:WalletTokenBalance ):number {
        if ( item1.symbol.toUpperCase() < item2.symbol.toUpperCase() ){
            return -1;
        }
        if ( item1.symbol.toUpperCase() > item2.symbol.toUpperCase() ){
            return 1;
        }
        return 0;
    }

    private static getTokenBalances = async (walletBalances: WalletBalance[], utilsContract: UtilitiesMessageBroadcaster): Promise<WalletTokenBalance[]> => {
        const allTokens: TokenProperties[] = await TokenHelper.getTrustedAssets(utilsContract)

        TerminalLogger.log(`All tokens retrieved...`)
        TerminalLogger.logPrettyJson(allTokens)

        const tokenBalances: WalletTokenBalance[] = []

        walletBalances.forEach(function (walletBalance) {
            const tokenData = allTokens.find(t => t.transactDenom.toLowerCase() === walletBalance.denom.toLowerCase())
            let tokenBalance: WalletTokenBalance = undefined

            if (!tokenData || !tokenData.exponent) {
                TerminalLogger.log(`Attempted to find token data for denom ${walletBalance.denom} but the result from TokenHelper.getTokenDistributions() did not contain any token with a matching baseDenom. The token properties will be limited for this denom.`)
                tokenBalance = {
                    transactDenom: null,
                    display: null,
                    name: null,
                    symbol: null,
                    symbolPng: null,
                    symbolSvg: null,
                    baseDenom: walletBalance.denom,
                    exponent: null,
                    baseAmount: parseInt(walletBalance.amount),
                    symbolAmount: null
                }
            } else {
                tokenBalance = {
                    transactDenom: tokenData.transactDenom,
                    display: tokenData.display,
                    name: tokenData.name,
                    symbol: tokenData.symbol,
                    symbolPng: tokenData.symbolPng,
                    symbolSvg: tokenData.symbolSvg,
                    baseDenom: tokenData.baseDenom,
                    exponent: tokenData.exponent,
                    baseAmount: parseInt(walletBalance.amount),
                    symbolAmount: TokenHelper.getSymbolAmount(parseInt(walletBalance.amount), tokenData.exponent)
                }
            }

            tokenBalances.push(tokenBalance)
        })

        return tokenBalances
    }
}