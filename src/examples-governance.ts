import {FuzionClient, GasPrice} from "./chain/utils/fuzion-client"
import { GovernanceHelper } from "./chain/utils/governance-helper"
import { AccessConfigUpdate } from "cosmjs-types/cosmwasm/wasm/v1/proposal";
import { AccessConfig } from "cosmjs-types/cosmwasm/wasm/v1/types";
import Long from "long";
import { coins } from "@cosmjs/proto-signing";

(async () => {
    const defaultGasPrice = GasPrice.fromString("0.025ukuji")
    const mnemonic = ""
    const rpcEndpoint = "https://test-rpc-kujira.mintthemoon.xyz"
    const fuzionClient = await FuzionClient.fromMnemonic(mnemonic, defaultGasPrice)

    const governanceClient = new GovernanceHelper(rpcEndpoint, defaultGasPrice)

    const accessConfigUpdates: AccessConfigUpdate[] = [
        {
            codeId: Long.fromNumber(70),
            instantiatePermission: AccessConfig.fromPartial({
                permission: 2,
                address: "kujira16qpvzhmawvsm8mcj4hdvtz25dadatdhhgw79xa"
            })
        },
        {
            codeId: Long.fromNumber(71),
            instantiatePermission: AccessConfig.fromPartial({
                permission: 2,
                address: "kujira16qpvzhmawvsm8mcj4hdvtz25dadatdhhgw79xa"
            })
        }
    ]

    const intitalDeposit = coins("10000000", "ukuji")
    const updateInstantiateConfigProposalResult = await governanceClient.updateInstantiateConfigProposal(
        fuzionClient.wallet,
        "Test Title",
        "Test Description",
        accessConfigUpdates,
        intitalDeposit
    )
    console.log(updateInstantiateConfigProposalResult)
})()