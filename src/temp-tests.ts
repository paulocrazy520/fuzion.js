import {FuzionClient, GasPrice} from "./chain/utils/fuzion-client"
import {UtilitiesFuzionChainConfig} from "./chain/contracts/fuzion-utilities/utilities-message-types"
import {Network} from "./chain/enums/network";
import {
    EscrowDetailsLite,
    OtcConfig,
    RichEscrowDetails
} from "./chain/contracts/fuzion-otc/otc-message-types";
import {WalletHelper} from "./chain/utils/wallet-helper";
import {ExecuteResult} from "@cosmjs/cosmwasm-stargate";
import {WalletTokenBalance} from "./chain/types/token-types";
import {Formatter} from "./core/utils/formatter";
import {UtilitiesMessageBroadcaster} from "./chain/contracts/fuzion-utilities/utilities-message-broadcaster";

let dev_config:UtilitiesFuzionChainConfig
const mnemonic1 ='market unhappy visa sugar save humor antique toilet fee flight hurt reopen'
const defaultGasPrice = GasPrice.fromString("0.025ukuji")

const kujiTesterAddr1 = 'kujira19pt7zejvlhlag8t8yjcktnvwd9mxaqza5xwe57'
const kujiTesterSeed1 = 'market unhappy visa sugar save humor antique toilet fee flight hurt reopen'

const kujiTesterAddr2 = 'kujira1le5g7evxamkytr56ld6qznvzd2ss94g7675mtf'
const kujiTesterSeed2 = 'system dynamic buddy purse raccoon ribbon play olive swarm glance moral lava'

const kujiTesterAddr3 = 'kujira1wzfdtmelyveugsexssa2mmgsmdgp0kazd4t72t'
const kujiTesterSeed3 = 'move outdoor hungry property october baby together whip drastic trust clever blush'


type escrowTerms = {
    creatorAmount: number,
    creatorDenom: string,
    receiverAmount: number,
    receiverDenom: string
}

type walletSnapshot = {
    wallet:string,
    balances: WalletTokenBalance[]
}

type snapshots = {
    creator: walletSnapshot,
    receiver: walletSnapshot,
    feeCollectors: walletSnapshot[]
}

const getAndInitClient = async (mnemonic:string):Promise<FuzionClient> => {
    //create a client using one of the factory functions.
    const fuzionClient = await FuzionClient.fromMnemonic(mnemonic)
    await fuzionClient.fetchConfig(Network.TESTNET)

    return fuzionClient
}

const getEscrowId = (result:ExecuteResult):number => {
    let escrowId = -1

    for(let i = 0; i < result.logs[0].events.length; i++) {
        const event = result.logs[0].events[i]
        const createEvent = event.attributes.find(a => a.key === 'action' && a.value === 'create')

        if(createEvent) {
            const idItem = event.attributes.find(a => a.key === 'id')
            escrowId = parseInt(idItem.value)
            break
        }
    }

    return escrowId
}

const assertEscrowDetails = (escrowUnderTest:RichEscrowDetails,
                             expectedEscrowDetails:EscrowDetailsLite,
                             creatorAddress:string,
                             recipientAddress:string,
                             expectedStatus:string,
                             ignoreRecipient:boolean) => {
    const baseErrorMsg = 'Escrow compared, the following fields contained errors:\r\n'
    let errorMsg = baseErrorMsg

    if(escrowUnderTest.title !== expectedEscrowDetails.title)
        errorMsg = errorMsg + `Title: Expected ${expectedEscrowDetails.title} but found ${escrowUnderTest.title}\r\n`

    if(escrowUnderTest.description !== expectedEscrowDetails.description)
        errorMsg = errorMsg + `Description: Expected ${expectedEscrowDetails.description} but found ${escrowUnderTest.description}\r\n`

    if(escrowUnderTest.arbiter !== expectedEscrowDetails.arbiter)
        errorMsg = errorMsg + `Arbiter: Expected ${expectedEscrowDetails.arbiter} but found ${escrowUnderTest.arbiter}\r\n`

    if(escrowUnderTest.creator != creatorAddress)
        errorMsg = errorMsg + `Creator: Expected ${creatorAddress} but found ${escrowUnderTest.creator}\r\n`

    if(!ignoreRecipient && escrowUnderTest.recipient != recipientAddress)
        errorMsg = errorMsg + `Recipient: Expected ${recipientAddress} but found ${escrowUnderTest.recipient}\r\n`

    if(escrowUnderTest.askingPrice.baseAmount !== parseInt(expectedEscrowDetails.asking_price.amount))
        errorMsg = errorMsg + `Asking Price: Expected ${expectedEscrowDetails.asking_price.amount} but found ${escrowUnderTest.askingPrice.baseAmount}\r\n`

    if(escrowUnderTest.askingPrice.baseDenom !== expectedEscrowDetails.asking_price.denom)
        errorMsg = errorMsg + `Receiver denom: Expected ${expectedEscrowDetails.asking_price.denom} but found ${escrowUnderTest.askingPrice.baseDenom}\r\n`

    // if(escrowUnderTest.end_time !== expectedEscrowDetails.end_time)
    //     errorMsg = errorMsg + `Expected end_time of ${expectedEscrowDetails.end_time} but found ${escrowUnderTest.end_time}\r\n`

    if(escrowUnderTest.status !== expectedStatus)
        errorMsg = errorMsg + `Expected status of ${expectedStatus}} but found ${escrowUnderTest.status}\r\n`

    if(errorMsg !== baseErrorMsg) {
        throw new Error(errorMsg)
    }
}


const assertUserBalances = (creatorBalanceSnapshot:WalletTokenBalance[],
                                receiverBalanceSnapshot:WalletTokenBalance[],
                                creatorBalanceCurrent:WalletTokenBalance[],
                                receiverBalanceCurrent:WalletTokenBalance[],
                                dealTerms:escrowTerms,
                                otcConfig:OtcConfig) => {
    const baseErrorMsg = 'Balances compared, the following balances were incorrect:\r\n'
    let errorMsg = baseErrorMsg

    errorMsg = errorMsg + assertDepositingAssetBalance(creatorBalanceSnapshot, creatorBalanceCurrent, dealTerms.creatorDenom, dealTerms.creatorAmount, 'creator')
    errorMsg = errorMsg + assertDepositingAssetBalance(receiverBalanceSnapshot, receiverBalanceCurrent, dealTerms.receiverDenom, dealTerms.receiverAmount, 'receiver')

    errorMsg = errorMsg + assertReceivingAssetBalance(creatorBalanceSnapshot, creatorBalanceCurrent, dealTerms.receiverDenom, dealTerms.receiverAmount, otcConfig.fees.creator,'creator')
    errorMsg = errorMsg + assertReceivingAssetBalance(receiverBalanceSnapshot, receiverBalanceCurrent, dealTerms.creatorDenom, dealTerms.creatorAmount, otcConfig.fees.receiver,'receiver')

    if(errorMsg !== baseErrorMsg) {
        throw new Error(errorMsg)
    }
}

//tests that a wallet balance went down by the amount that was deposited
const assertDepositingAssetBalance = (snapshotBalance:WalletTokenBalance[], currentBalance:WalletTokenBalance[], denom:string, amount:number, dealSide:string):string => {
    const snapTokenBal = snapshotBalance.find(tokenBalance => tokenBalance.baseDenom === denom)
    const currentTokenBal = currentBalance.find(tokenBalance => tokenBalance.baseDenom === denom)
    const expectedBal = snapTokenBal.baseAmount - amount

    if(expectedBal !== currentTokenBal.baseAmount) {
        return `The balance for the ${dealSide} tokens they were depositing is incorrect. Expected ${expectedBal} but found ${currentTokenBal.baseAmount}\r\n`
    }

    return ''
}

//tests that a wallet balance went up by the amount received in an escrow deal, less commission
const assertReceivingAssetBalance = (snapshotBalance:WalletTokenBalance[], currentBalance:WalletTokenBalance[], denom:string, amount:number, commission:number, dealSide:string):string => {
    const snapTokenBal = snapshotBalance.find(tokenBalance => tokenBalance.baseDenom === denom)
    const currentTokenBal = currentBalance.find(tokenBalance => tokenBalance.baseDenom === denom)
    const expectedBal = snapTokenBal.baseAmount + (amount * ((100-commission)/100))

    if(expectedBal !== currentTokenBal.baseAmount) {
        return `The balance for the ${dealSide} tokens they were receiving is incorrect. Expected ${expectedBal} but found ${currentTokenBal.baseAmount}\r\n`
    }

    return ''
}

const assertCommissionsReceived = async (dealTerms:escrowTerms, otcConfig:OtcConfig, collectorSnapshots:walletSnapshot[], utilsContract:UtilitiesMessageBroadcaster, lcdUrl:string) =>{
    const baseErrorMsg = 'Fee Collector balances compared, the following balances were incorrect:\r\n'
    let errorMsg = baseErrorMsg

    //loop each fee collector and test that their balance has incremented by the expected commission
    for(let i= 0; i<collectorSnapshots.length; i++) {
        const walletSnapshot = collectorSnapshots[i]
        console.log(`Asserting comm for ${walletSnapshot.wallet}`)

        const collectorCurrentBalances = await WalletHelper.getWalletBalances(walletSnapshot.wallet, utilsContract, lcdUrl)
        const collectorSnapshotBalances = walletSnapshot.balances

        const collectorCommPercentage = otcConfig.fee_collectors.find(f => f.address === walletSnapshot.wallet).percentage

        const side1Denom = dealTerms.receiverDenom
        const side1TotalCommission = dealTerms.receiverAmount * ((100 - otcConfig.fees.receiver)/100)
        const side1CommForThisCollector = side1TotalCommission * (collectorCommPercentage / 100)
        const side1DenomSnapshot = collectorSnapshotBalances.find(t => t.baseDenom === side1Denom).baseAmount
        const side1DenomCurrent = collectorCurrentBalances.find(t => t.baseDenom === side1Denom).baseAmount
        const expectedSide1Balance = side1DenomSnapshot + side1CommForThisCollector

        console.log(`Creator Comm Deets:`)
        console.log(`Denom: ${side1Denom}, Comm: ${side1CommForThisCollector}, Snap: ${side1DenomSnapshot}, Current: ${side1DenomCurrent}`)

        if(expectedSide1Balance !== side1DenomCurrent) {
            errorMsg = errorMsg + `The collector with address ${walletSnapshot.wallet} has the incorrect balance. Expected ${expectedSide1Balance}${side1Denom} but found ${side1DenomCurrent}${side1Denom}`
        }


        const side2Denom = dealTerms.creatorDenom
        const side2TotalCommission = dealTerms.creatorAmount * ((100 - otcConfig.fees.creator)/100)
        const side2CommForThisCollector = side2TotalCommission * (collectorCommPercentage / 100)
        const side2DenomSnapshot = collectorSnapshotBalances.find(t => t.baseDenom === side2Denom).baseAmount
        const side2DenomCurrent = collectorCurrentBalances.find(t => t.baseDenom === side2Denom).baseAmount
        const expectedSide2Balance = side2DenomSnapshot + side2CommForThisCollector

        console.log(`Receiver Comm Deets:`)
        console.log(`Denom: ${side2Denom}, Comm: ${side2CommForThisCollector}, Snap: ${side2DenomSnapshot}, Current: ${side2DenomCurrent}`)

        if(expectedSide2Balance !== side2DenomCurrent) {
            errorMsg = errorMsg + `The collector with address ${walletSnapshot.wallet} has the incorrect balance. Expected ${expectedSide2Balance}${side2Denom} but found ${side2DenomCurrent}${side2Denom}`
        }
    }

    if (errorMsg !== baseErrorMsg) {
        throw new Error(errorMsg)
    }

    return ''
}

const getBalanceSnapshots = async (utilsContract:UtilitiesMessageBroadcaster, otcConfig:OtcConfig, lcdUrl:string):Promise<snapshots> => {
    const creatorWalletBalanceSnapshot = await WalletHelper.getWalletBalances(kujiTesterAddr1, utilsContract, lcdUrl)
    const receiverWalletBalanceSnapshot = await WalletHelper.getWalletBalances(kujiTesterAddr2, utilsContract, lcdUrl)

    const feeCollectorSnaps:walletSnapshot[] = []
    for(let i=0;i<otcConfig.fee_collectors.length;i++){
        const addy = otcConfig.fee_collectors[i].address
        const collectorSnap = await WalletHelper.getWalletBalances(addy, utilsContract, lcdUrl)
        feeCollectorSnaps.push({wallet:addy, balances: collectorSnap})
    }

    return {
        creator: { wallet:kujiTesterAddr1 ,balances: creatorWalletBalanceSnapshot },
        receiver: {wallet:kujiTesterAddr2, balances: receiverWalletBalanceSnapshot} ,
        feeCollectors: feeCollectorSnaps
    }
}

/**
 * A test that:
 * Creates an order, setting a receiving address.
 * Makes a deposit by the receiver.
 * Validates that the OTC closed after receiver deposit.
 * Validates wallet balances for creator.
 * Validates wallet balances for receiver.
 * Validates commissions were collected.
 */
const test_otc_create_with_receiver = async () => {
    console.log('Running test_otc_create_with_receiver')

    //arrange-------------------------------------------------------------------------------------------------------------------------------
    const creatorFuzionClient = await getAndInitClient(kujiTesterSeed1)
    const receiverFuzionClient = await getAndInitClient(kujiTesterSeed2)

    const terms: escrowTerms = {
        creatorAmount:1_000_000,
        creatorDenom: 'factory/kujira1r85reqy6h0lu02vyz0hnzhv5whsns55gdt4w0d7ft87utzk7u0wqr4ssll/uusk',
        receiverAmount:1_000_000,
        receiverDenom: 'factory/kujira1ltvwg69sw3c5z99c6rr08hal7v0kdzfxz07yj5/demo'
    }

    const newEscrow: EscrowDetailsLite = {
        arbiter: null,
        asking_price: { amount: terms.receiverAmount.toString(), denom: terms.receiverDenom },
        description:'OTC Create Description',
        recipient: null,//'kujira1le5g7evxamkytr56ld6qznvzd2ss94g7675mtf',
        title: 'OTC Create Title',
        end_time:null
    }

    const escrowConfig:OtcConfig = await receiverFuzionClient.otcContract.queryConfig()

    console.log('Snapshotting balances...')
    const allSnapshots = await getBalanceSnapshots(creatorFuzionClient.utilsContract, escrowConfig, creatorFuzionClient.chainConfig.chain_lcd_url)

    //act and assert------------------------------------------------------------------------------------------------------------------------------

    //create the OTC
    console.log('Creating Escrow...')
    const createResult = await creatorFuzionClient.otcContract.executeCreate(newEscrow,[{ amount: terms.creatorAmount.toString(), denom: terms.creatorDenom }])
    const escrowId = getEscrowId(createResult)

    if(escrowId === -1) {
        throw new Error('Escrow failed to create')
    }

    console.log(`EscrowId ${escrowId}`)

    //Get the escrow state
    const activeEscrow:RichEscrowDetails = await creatorFuzionClient.otcContract.queryMarketEscrow(escrowId)
    console.log('Asserting Escrow Details...')
    assertEscrowDetails(activeEscrow, newEscrow, kujiTesterAddr1, kujiTesterAddr2, 'Active',true)

    //Make deposit from receiver
    await receiverFuzionClient.otcContract.executeReceiverDeposit(escrowId, [{amount: terms.receiverAmount.toString(), denom: terms.receiverDenom}])
    const completedEscrow:RichEscrowDetails = await creatorFuzionClient.otcContract.queryMarketEscrow(escrowId)


    //test that the escrow got closed when the 2nd deposit came in
    if(completedEscrow.status !== 'Completed')
        throw new Error(`Expected to find status of Completed but found ${completedEscrow.status}`)

    //test deposited balances
    if(completedEscrow.creatorBalance[0].baseAmount !== terms.creatorAmount)
        throw new Error('Creator deposit is incorrect')

    if(completedEscrow.creatorBalance[0].baseDenom !== terms.creatorDenom)
        throw new Error('Creator denom is incorrect')

    if(completedEscrow.recipientBalance[0].baseAmount !== terms.receiverAmount)
        throw new Error('Receiver deposit is incorrect')

    if(completedEscrow.recipientBalance[0].baseDenom !== terms.receiverDenom)
        throw new Error('Receiver denom is incorrect')

    console.log('Retrieving current balances...')
    const creatorWalletBalanceCurrent = await WalletHelper.getWalletBalances(kujiTesterAddr1, creatorFuzionClient.utilsContract, creatorFuzionClient.chainConfig.chain_lcd_url)
    const receiverWalletBalanceCurrent = await WalletHelper.getWalletBalances(kujiTesterAddr2, receiverFuzionClient.utilsContract, creatorFuzionClient.chainConfig.chain_lcd_url)

    await assertUserBalances(allSnapshots.creator.balances, allSnapshots.receiver.balances, creatorWalletBalanceCurrent, receiverWalletBalanceCurrent, terms, escrowConfig)
    //await assertCommissionsReceived(terms, escrowConfig, allSnapshots.feeCollectors, creatorFuzionClient.utilsContract)

    console.log('Test passed.')
}

const test_otc_hack_refund = async () => {
    console.log('Running test_otc_hack_refund')

    //arrange-------------------------------------------------------------------------------------------------------------------------------
    const creatorFuzionClient = await getAndInitClient(kujiTesterSeed1)
    const hackerFuzionClient = await getAndInitClient(kujiTesterSeed2)

    const terms: escrowTerms = {
        creatorAmount:1_000_000,
        creatorDenom: 'factory/kujira1r85reqy6h0lu02vyz0hnzhv5whsns55gdt4w0d7ft87utzk7u0wqr4ssll/uusk',
        receiverAmount:1_000_000,
        receiverDenom: 'ukuji'
    }

    const newEscrow: EscrowDetailsLite = {
        arbiter: null,
        asking_price: { amount: terms.receiverAmount.toString(), denom: terms.receiverDenom },
        description:'OTC Create Description',
        recipient: null,
        title: 'OTC Create Title',
        end_time:null
    }

    const escrowConfig:OtcConfig = await creatorFuzionClient.otcContract.queryConfig()
    //act and assert------------------------------------------------------------------------------------------------------------------------------

    //create the OTC
    console.log('Creating Escrow...')
    const createResult = await creatorFuzionClient.otcContract.executeCreate(newEscrow,[{ amount: terms.creatorAmount.toString(), denom: terms.creatorDenom }])
    const escrowId = getEscrowId(createResult)

    if(escrowId === -1) {
        throw new Error('Escrow failed to create')
    }

    console.log(`EscrowId ${escrowId}`)

    //Attempt to refund from an account other than the creator
    console.log('Attempting to steal funds...')
    try{
        await hackerFuzionClient.otcContract.executeRefund(escrowId)
    }
    catch (error) {
        console.log('Execute was rejected')
    }

    const activeEscrow:RichEscrowDetails = await creatorFuzionClient.otcContract.queryMarketEscrow(escrowId)
    console.log('Asserting Escrow Details...')
    assertEscrowDetails(activeEscrow, newEscrow, kujiTesterAddr1, kujiTesterAddr2, 'Active',true)

    console.log('Test passed.')
}

const test_otc_create_with_receiver_deposit_from_someone_else = async () => {
    console.log('Running test_otc_create_with_receiver_deposit_from_someone_else')

    //arrange-------------------------------------------------------------------------------------------------------------------------------
    const creatorFuzionClient = await getAndInitClient(kujiTesterSeed1)
    const wrongAddressFuzionClient = await getAndInitClient(kujiTesterSeed3)

    const terms: escrowTerms = {
        creatorAmount:1_000_000,
        creatorDenom: 'factory/kujira1r85reqy6h0lu02vyz0hnzhv5whsns55gdt4w0d7ft87utzk7u0wqr4ssll/uusk',
        receiverAmount:1_000_000,
        receiverDenom: 'ukuji'
    }

    const newEscrow: EscrowDetailsLite = {
        arbiter: null,
        asking_price: { amount: terms.receiverAmount.toString(), denom: terms.receiverDenom },
        description:'OTC Create Description',
        recipient: 'kujira1le5g7evxamkytr56ld6qznvzd2ss94g7675mtf',//seed 2
        title: 'OTC Create Title',
        end_time:null
    }

    const escrowConfig:OtcConfig = await wrongAddressFuzionClient.otcContract.queryConfig()
    //act and assert------------------------------------------------------------------------------------------------------------------------------

    //create the OTC
    console.log('Creating Escrow...')
    const createResult = await creatorFuzionClient.otcContract.executeCreate(newEscrow,[{ amount: terms.creatorAmount.toString(), denom: terms.creatorDenom }])
    const escrowId = getEscrowId(createResult)

    if(escrowId === -1) {
        throw new Error('Escrow failed to create')
    }

    console.log(`EscrowId ${escrowId}`)

    try {
        //Make deposit from wrong account
        await wrongAddressFuzionClient.otcContract.executeReceiverDeposit(escrowId, [{amount: terms.receiverAmount.toString(), denom: terms.receiverDenom}])
    }
    catch (error) {
        console.log('Deposit rejected.')
    }

    const activeEscrow:RichEscrowDetails = await creatorFuzionClient.otcContract.queryMarketEscrow(escrowId)
    console.log('Asserting Escrow Details...')
    assertEscrowDetails(activeEscrow, newEscrow, kujiTesterAddr1, kujiTesterAddr2, 'Active',true)

    console.log('Test passed.')
}

const test_otc_config_non_admin_change = async () => {
    console.log('Runnning test_otc_config_non_admin_change...')
    const nonAdminuzionClient = await getAndInitClient(kujiTesterSeed3)

    const config:OtcConfig = {
        admins: {
            config_admin: kujiTesterAddr1,
            confirm_admin: kujiTesterAddr2
        },
        fees: {
            creator: 1,
            receiver: 1
        },
        fee_collectors: [{ address: kujiTesterAddr1, percentage: 1}]
    }

    try {
        await nonAdminuzionClient.otcContract.executeConfigUpdate(config)
    }
    catch (error) {
        console.log('Config change rejected.')
    }

    console.log('Test passed.')
}

const test_otc_config_admin_change = async () => {
    console.log('Running test_otc_config_admin_change...')
    const adminFuzionClient = await getAndInitClient(kujiTesterSeed1)

    const config: OtcConfig = await adminFuzionClient.otcContract.queryConfig()

    await adminFuzionClient.otcContract.executeConfigUpdate(config)
    console.log('Config change accepted.')
    console.log('Test passed.')
}

const test_otc_pending_config_non_admin_confirm = async () => {
    console.log('Running test_otc_pending_config_non_admin_confirm...')
    const nonAdminFuzionClient = await getAndInitClient(kujiTesterSeed3)

    try {
        await nonAdminFuzionClient.otcContract.executeConfirmPendingConfig()
    }
    catch (error) {
        console.log('Config approval rejected.')
    }

    console.log('Test passed.')
}

const test_otc_create_with_receiver_and_arbiter = async () => {
    console.log('Running test_otc_create_with_receiver')

    //arrange-------------------------------------------------------------------------------------------------------------------------------
    const creatorFuzionClient = await getAndInitClient(kujiTesterSeed1)
    const receiverFuzionClient = await getAndInitClient(kujiTesterSeed2)
    const arbiterFuzionClient = await getAndInitClient(kujiTesterSeed3)

    const terms: escrowTerms = {
        creatorAmount:1_000_000,
        creatorDenom: 'factory/kujira1r85reqy6h0lu02vyz0hnzhv5whsns55gdt4w0d7ft87utzk7u0wqr4ssll/uusk',
        receiverAmount:1_000_000,
        receiverDenom: 'factory/kujira1ltvwg69sw3c5z99c6rr08hal7v0kdzfxz07yj5/demo'
    }

    const newEscrow: EscrowDetailsLite = {
        arbiter: kujiTesterAddr3,
        asking_price: { amount: terms.receiverAmount.toString(), denom: terms.receiverDenom },
        description:'OTC Create Description',
        recipient: kujiTesterAddr2,
        title: 'OTC Create Title',
        end_time:null
    }

    const escrowConfig:OtcConfig = await receiverFuzionClient.otcContract.queryConfig()

    console.log('Snapshotting balances...')
    const allSnapshots = await getBalanceSnapshots(creatorFuzionClient.utilsContract, escrowConfig, creatorFuzionClient.chainConfig.chain_lcd_url)

    //act and assert------------------------------------------------------------------------------------------------------------------------------

    //create the OTC
    console.log('Creating Escrow...')
    const createResult = await creatorFuzionClient.otcContract.executeCreate(newEscrow,[{ amount: terms.creatorAmount.toString(), denom: terms.creatorDenom }])
    const escrowId = getEscrowId(createResult)

    if(escrowId === -1) {
        throw new Error('Escrow failed to create')
    }

    console.log(`EscrowId ${escrowId}`)

    //Get the escrow state
    const activeEscrow:RichEscrowDetails = await creatorFuzionClient.otcContract.queryMarketEscrow(escrowId)
    console.log('Asserting Escrow Details...')
    assertEscrowDetails(activeEscrow, newEscrow, kujiTesterAddr1, kujiTesterAddr2, 'Active',true)

    //Make deposit from receiver
    console.log('Making deposit from receiver wallet')
    await receiverFuzionClient.otcContract.executeReceiverDeposit(escrowId, [{amount: terms.receiverAmount.toString(), denom: terms.receiverDenom}])

    console.log('Checking that Escrow did not auto close.')
    const pendingApprovalEscrow:RichEscrowDetails = await creatorFuzionClient.otcContract.queryMarketEscrow(escrowId)

    //test that the escrow stayed open when the 2nd deposit came in
    if(pendingApprovalEscrow.status !== 'Active')
        throw new Error(`Expected to find status of Active but found ${pendingApprovalEscrow.status}`)

    console.log('Approving escrow with arbiter wallet')
    await arbiterFuzionClient.otcContract.executeApprove(escrowId)

    console.log('Checking that Escrow closed after arbiter approval.')
    const completedEscrow:RichEscrowDetails = await creatorFuzionClient.otcContract.queryMarketEscrow(escrowId)

    if(completedEscrow.status !== 'Completed')
        throw new Error(`Expected to find status of Active but found ${completedEscrow.status}`)

    //test deposited balances
    if(completedEscrow.creatorBalance[0].baseAmount !== terms.creatorAmount)
        throw new Error('Creator deposit is incorrect')

    if(completedEscrow.creatorBalance[0].baseDenom !== terms.creatorDenom)
        throw new Error('Creator denom is incorrect')

    if(completedEscrow.recipientBalance[0].baseAmount !== terms.receiverAmount)
        throw new Error('Receiver deposit is incorrect')

    if(completedEscrow.recipientBalance[0].baseDenom !== terms.receiverDenom)
        throw new Error('Receiver denom is incorrect')

    console.log('Retrieving current balances...')
    const creatorWalletBalanceCurrent = await WalletHelper.getWalletBalances(kujiTesterAddr1, creatorFuzionClient.utilsContract, creatorFuzionClient.chainConfig.chain_lcd_url)
    const receiverWalletBalanceCurrent = await WalletHelper.getWalletBalances(kujiTesterAddr2, receiverFuzionClient.utilsContract, creatorFuzionClient.chainConfig.chain_lcd_url)

    await assertUserBalances(allSnapshots.creator.balances, allSnapshots.receiver.balances, creatorWalletBalanceCurrent, receiverWalletBalanceCurrent, terms, escrowConfig)
    //await assertCommissionsReceived(terms, escrowConfig, allSnapshots.feeCollectors, creatorFuzionClient.utilsContract)

    console.log('Test passed.')
}

(async () => {
    // await test_otc_create_with_receiver()
    // console.log('----------------------------------------------------------------------------')
    // await test_otc_hack_refund()
    // console.log('----------------------------------------------------------------------------')
    //await test_otc_create_with_receiver_deposit_from_someone_else()
    //console.log('----------------------------------------------------------------------------')
    //await test_otc_config_non_admin_change()
    //console.log('----------------------------------------------------------------------------')
    // await test_otc_config_admin_change()
    // console.log('----------------------------------------------------------------------------')
    //await test_otc_pending_config_non_admin_confirm()
    //console.log('----------------------------------------------------------------------------')
    await test_otc_create_with_receiver_and_arbiter()
    console.log('----------------------------------------------------------------------------')
})()