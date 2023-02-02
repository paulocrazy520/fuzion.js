import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { GasPrice, Coin, StdFee, MsgSubmitProposalEncodeObject, DeliverTxResponse }  from "@cosmjs/stargate";
import { InstantiateContractProposal, UpdateInstantiateConfigProposal, AccessConfigUpdate } from "cosmjs-types/cosmwasm/wasm/v1/proposal";
import { MsgSubmitProposal } from "cosmjs-types/cosmos/gov/v1beta1/tx";

export class GovernanceHelper {
    rpcEndpoint: string
    gasPrice?: GasPrice

    constructor (rpcEndpoint: string, gasPrice?: GasPrice) {
        this.rpcEndpoint = rpcEndpoint
        this.gasPrice = gasPrice
    }

    instantiateProposal = async (wallet: OfflineSigner,
        title: string,
        description: string,
        runAs: string,
        admin: string,
        codeId: Long,
        label: string,
        msg: Uint8Array,
        funds: Coin[],
        initialDeposit: Coin[],
        accountIndex = 0,        
        fee: number | StdFee | "auto" = "auto"):Promise<DeliverTxResponse> => {
        const accounts = await wallet.getAccounts()
        const account = accounts[accountIndex]

        const cwClient = await SigningCosmWasmClient.connectWithSigner(this.rpcEndpoint, wallet, { gasPrice: this.gasPrice })
        
        const content = InstantiateContractProposal.fromPartial({
            title: title,
            description: description,
            runAs: runAs,
            admin: admin,
            codeId: codeId,
            label: label,
            msg: msg,
            funds: funds
        })

        const instantiateProposalMsg: MsgSubmitProposalEncodeObject = {
            typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal",
            value: MsgSubmitProposal.fromPartial({
                initialDeposit: initialDeposit,
                proposer: account.address,
                content: {
                    typeUrl: "/cosmwasm.wasm.v1.InstantiateContractProposal",
                    value: InstantiateContractProposal.encode({
                        ...content,
                        codeId: codeId,
                        msg: msg,
                    }).finish()
                }
            })
        }

        const broadcastResult = await cwClient.signAndBroadcast(account.address, [instantiateProposalMsg], fee)
        return broadcastResult
    }

    updateInstantiateConfigProposal = async (wallet: OfflineSigner,
        title: string,
        description: string,
        accessConfigUpdates: AccessConfigUpdate[],
        initialDeposit: Coin[],
        accountIndex = 0,        
        fee: number | StdFee | "auto" = "auto"):Promise<DeliverTxResponse> => {
        const accounts = await wallet.getAccounts()
        const account = accounts[accountIndex]

        const cwClient = await SigningCosmWasmClient.connectWithSigner(this.rpcEndpoint, wallet, { gasPrice: this.gasPrice })
        
        const content = UpdateInstantiateConfigProposal.fromPartial({
            title: title,
            description: description,
            accessConfigUpdates: accessConfigUpdates
        })

        const updateInstantiateConfigProposalMsg: MsgSubmitProposalEncodeObject = {
            typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal",
            value: MsgSubmitProposal.fromPartial({
                initialDeposit: initialDeposit,
                proposer: account.address,
                content: {
                    typeUrl: "/cosmwasm.wasm.v1.UpdateInstantiateConfigProposal",
                    value: UpdateInstantiateConfigProposal.encode({
                        ...content,
                    }).finish()
                }
            })
        }

        const broadcastResult = await cwClient.signAndBroadcast(account.address, [updateInstantiateConfigProposalMsg], fee)
        return broadcastResult
    }
}