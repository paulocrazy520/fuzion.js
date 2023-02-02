//https://github.com/ATLO-Labs/fusion-otc/tree/main/schema
import {EscrowDetailsLite, OtcConfig} from "./otc-message-types"
import {TerminalLogger} from "../../utils/terminal-logger";

/**
 * A class that provides builder functions to construct execute and query messages for the OTC smart contract.
 */
export class OtcMessageBuilder {

    //execute messages
    public static getCreateExecute = (escrowDetails:EscrowDetailsLite): Record<string, unknown> => {
        const msg = {
            create: escrowDetails
        }

        return msg
    }

    public static getRefundExecute = (id: number): Record<string, unknown> => {
        const msg = {
            refund: {
                id: id
            }
        }

        return msg
    }

    public static getSetRecipientExecute = (id: number, recipient: string): Record<string, unknown> => {
        const msg = {
            set_recipient: {
                id: id,
                recipient: recipient
            }
        }

        return msg
    }

    public static getReceiverDepositExecute = (id: number): Record<string, unknown> => {
        const msg = {
            receiver_deposit: {
                id: id
            }
        }

        return msg
    }

    public static getApproveExecute = (id: number): Record<string, unknown> => {
        const msg = {
            approve: {
                id: id
            }
        }

        return msg
    }

    public static getUpdateConfigExecute = (config: OtcConfig): Record<string, unknown> => {
        const msg = {
            update_config: config
        }

        return msg
    }

    public static getConfirmConfigExecute = (): Record<string, unknown> => {
        const msg = {
            confirm_config: {}
        }

        return msg
    }


    //query messages
    public static getConfigQuery = (): Record<string, unknown> => {
        const msg = {
            config: {}
        }

        return msg
    }

    public static getPendingConfigQuery = (): Record<string, unknown> => {
        const msg = {
            pending_config: {}
        }

        return msg
    }

    public static getMarketEscrowListQuery = (startAfter?: any, limit?: number, sortAsc?: boolean): Record<string, unknown> => {
        const msg = {
            market_escrow_list: {
                start_after: startAfter,
                limit: limit,
                sort_asc: sortAsc
            }
        }

        return msg
    }

    public static getMarketEscrowActiveListQuery = (startAfter?: any, limit?: number, sortAsc?: boolean): Record<string, unknown> => {
        const msg = {
            market_escrow_active_list: {
                start_after: startAfter,
                limit: limit,
                sort_asc: sortAsc
            }
        }

        return msg
    }

    public static getPairsListQuery = (pair?: [string, string], startAfter?: any, limit?: number, sortAsc?: boolean): Record<string, unknown> => {
        const msg = {
            pairs_list:
                {
                    pair: pair,
                    start_after: startAfter,
                    limit: limit,
                    sort_asc: sortAsc
                }
        }

        return msg
    }

    public static getPairsActiveListQuery = (pair?: [string, string], startAfter?: any, limit?: number, sortAsc?: boolean): Record<string, unknown> => {
        const msg = {
            market_escrow_active_pairs_list:
                {
                    pair: pair,
                    start_after: startAfter,
                    limit: limit,
                    sort_asc: sortAsc
                }
        }

        return msg
    }

    public static getPairsCountQuery = (): Record<string, unknown> => {
        const msg = {
            pairs_count: {}
        }

        return msg
    }

    public static getActivePairsCountQuery = (): Record<string, unknown> => {
        const msg = {
            market_escrow_active_pairs_count: {}
        }

        return msg
    }

    public static getCreatorEscrowListQuery = (creator: string, startAfter: number, limit: number, sortAsc: boolean): Record<string, unknown> => {
        const msg = {
            creator_escrow_list:
                {
                    creator: creator,
                    start_after: startAfter,
                    limit: limit,
                    sort_asc: sortAsc
                }
        }

        return msg
    }

    public static getRecipientEscrowListQuery = (recipient: string, startAfter?: number, limit?: number, sortAsc?: boolean): Record<string, unknown> => {
        const msg = {
            recipient_escrow_list:
                {
                    recipient: recipient,
                    start_after: startAfter,
                    limit: limit,
                    sort_asc: sortAsc
                }
        }

        return msg
    }

    public static getMarketEscrowQuery = (id: number): Record<string, unknown> => {
        const msg = {
            escrow: {
                id: id
            }
        }

        return msg
    }
}