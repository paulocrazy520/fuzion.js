import {FuzionClient, GasPrice} from "./chain/utils/fuzion-client";
import {FuzionConfigClient} from "./chain/utils/fuzion-config-client";
import {TokenHelper} from "./chain/utils/token-helper";

(async () => {
    const fuzionChainConfigClient = new FuzionConfigClient();
    const fuzionChainConfig = await fuzionChainConfigClient.getFuzionChainConfig();

    const dev_config = fuzionChainConfig.data.find((config) => config.chain_config.chain_name === "kujira-devnet")?.chain_config
    const RPC_DEV = dev_config.chain_url
    const mnemonic ='surround miss nominee dream gap cross assault thank captain prosper drop duty group candy wealth weather scale put'
    const otcContractAddress = dev_config.chain_contracts.find((contract) => contract.contract_name === "OTC_FUNGIBLE_TOKEN")?.contract_address

    //create a client using one of the factory functions.
    const defaultGasPrice = GasPrice.fromString("0.025ukuji")
    const fuzionClient = await FuzionClient.fromMnemonic(mnemonic)

    //turn internal logging on or off
    fuzionClient.enableLogging(false)

    //init the OTC contract MessageBroadcaster before we call functions on it.
    fuzionClient.initOtcContract(otcContractAddress)

    //run a contract query message
    try {
        const result2 = await fuzionClient.otcContract.queryConfig()
        console.log('response:')
        console.log(JSON.stringify(result2, null, 2))
    }
    catch (error) {
        console.log(error)
    }

    //get the list of token pairs with active Escrows
    const result1 = await fuzionClient.otcContract.queryPairsCount()
    // the pairs result currently looks like the below. the "utoken" will be converted to token tickers in the near future.
    // [
    // {
    //     "denom1": "ukuji",
    //     "denom2": "ukuji",
    //     "count": 4
    // },
    //     {
    //         "denom1": "uatom",
    //         "denom2": "ukuji",
    //         "count": 5
    //     }
    // ]


    //samples using valid params for the utilsContract functions
    fuzionClient.initUtilsContract("kujira10qt8wg0n7z740ssvf3urmvgtjhxpyp74hxqvqt7z226gykuus7eqedsw8k")
    //returns the admin wallet for the contract
    const result2 = await fuzionClient.utilsContract.queryAdmin()

    //returns a ton of info on the chain.
    const result3 = await fuzionClient.utilsContract.queryChain('kujira')

    const result4 = await fuzionClient.utilsContract.queryChainList(null, 10)

    //the asset queries include the decimals, token image etc in their results.
    const result5 = await fuzionClient.utilsContract.queryAsset('kuji', 'kujira')
    const result6 = await fuzionClient.utilsContract.queryAssetList(null, 10)
    const result7 = await fuzionClient.utilsContract.queryCuratedAssetList(null, 10)
    const result8 = await fuzionClient.utilsContract.queryAssetListByBase('ukuji', null, 10)
    const result9 = await fuzionClient.utilsContract.queryAssetListByDisplay('kuji',null, 10)
    const result10 = await fuzionClient.utilsContract.queryAssetListBySymbol('kuji', null, 10)
    const result11 = await fuzionClient.utilsContract.queryAssetListByIbcHash('27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2', null, 10)
    const result12 = await fuzionClient.utilsContract.queryAssetListByIbcPathAndBaseDenom("transfer/channel-3/transfer/channel-113", "uhuahua", null, 10)
    const result13 = await fuzionClient.utilsContract.queryIbcPath('kujira', 'osmosis')
    const result14 = await fuzionClient.utilsContract.queryIbcPathList(null, 10)
    const result15 = await fuzionClient.utilsContract.queryIbcPathDenomsList(null, 10)


    //Get a list of tokens and their properties
    //Pass in the utilsContract off an initialised FuzionClient
    const tokens = await TokenHelper.getTokenDistributions(fuzionClient.utilsContract)
    //Sample Result:
    // [
    // {
    //     display: 'atom',
    //     name: 'Cosmos',
    //     symbol: 'ATOM',
    //     symbolPng: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
    //     symbolSvg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg',
    //     baseDenom: 'uatom',
    //     exponent: 6
    // },
    // {
    //     display: 'kuji',
    //     name: 'Kuji',
    //     symbol: 'KUJI',
    //     symbolPng: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kuji.png',
    //     symbolSvg: undefined,
    //     baseDenom: 'ukuji',
    //     exponent: 6
    // },
    // {
    //     display: 'scrt',
    //     name: 'Secret Network',
    //     symbol: 'SCRT',
    //     symbolPng: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.png',
    //     symbolSvg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.svg',
    //     baseDenom: 'uscrt',
    //     exponent: 6
    // }
    // ]


    //get a wallet's balances
    const result = await fuzionClient.getWalletBalances('kujira1asdasdwsfd....')
    // [
    // {
    //     display: 'atom',
    //     name: 'Cosmos',
    //     symbol: 'ATOM',
    //     symbolPng: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
    //     symbolSvg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg',
    //     baseDenom: 'uatom',
    //     exponent: 6,
    //     baseAmount: '10000000',
    //     symbolAmount: 10
    // },
    //     {
    //         display: 'kuji',
    //         name: 'Kuji',
    //         symbol: 'KUJI',
    //         symbolPng: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kuji.png',
    //         symbolSvg: undefined,
    //         baseDenom: 'ukuji',
    //         exponent: 6,
    //         baseAmount: '10123456',
    //         symbolAmount: 10.123456
    //     }
    // ]
})()