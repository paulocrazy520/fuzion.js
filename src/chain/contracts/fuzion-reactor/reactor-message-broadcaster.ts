import {OfflineSigner} from "@cosmjs/proto-signing";
import {ContractHelper} from "../../utils/contract-helper";
import {MessageBroadcaster} from "../base/message-broadcaster";

export class ReactorMessageBroadcaster extends MessageBroadcaster {

    constructor(contractAddress:string, wallet:OfflineSigner, rpcEndpoint:string, contractHelper:ContractHelper) {
        super(contractAddress, wallet, rpcEndpoint, contractHelper)
    }
}