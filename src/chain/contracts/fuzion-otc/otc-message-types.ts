export type OtcConfig = {
    admins: {
        config_admin: string,
        confirm_admin: string,
    },
    fees: {
        creator: number,
        receiver: number,
    },
    fee_collectors: {
        address: string,
        percentage: number
    }[]
}

/**
 * Use this to encapsulate the data used to create a new Escrow. It is a slimmed down version of {@link EscrowDetails}
 * containing only the fields needed during creation.
 * @property arbiter - A wallet address of a 3rd party who will oversee completion of the Escrow. This is optional.
 * @property recipient - A wallet address of the person who will be filling the other side of the Escrow. This is optional.
 * @property title - A title for the Escrow. This is optional.
 * @property description - A description for the Escrow. This is optional.
 * @property end_time - An expiry time for the Escrow, in epoch format. Maxes at 2 days, anything higher will be set as 2 days.
 * @property asking_price - The asking price for the assets in the Escrow. This is proposed by the creator of the Escrow.
 */
export type EscrowDetailsLite = {
    arbiter: string | null;
    recipient: string | null;
    title: string | null;
    description: string | null;
    end_time: number;
    asking_price: {
        amount: string;
        denom: string;
    }
}

/**
 * Represents an Escrow on chain.
 * @property id A unique identifier for an Escrow.
 * @property creator The wallet address of the person creating the Escrow.
 * @property created_at When the Escrow was created, in Epoch format.
 * @property arbiter The wallet address of a 3rd party who will oversee completion of the Escrow.
 * @property recipient The wallet address of the person who will be filling the other side of the Escrow.
 * @property title A title for the Escrow.
 * @property description A description for the Escrow.
 * @property end_height An
 * @property end_time An
 * @property creator_balance The balance deposited by the creator side of the Escrow.
 * @property asking_price The asking price for the assets in the Escrow. This is proposed by the creator of the Escrow.
 * @property recipient_balance The balance deposited by the receiving side of the Escrow.
 * @property status The status of an Escrow.
 */
export type EscrowDetails = {
    id: number,
    creator: string,
    created_at: number,
    arbiter: string,
    recipient: string,
    title: string,
    description: string,
    end_height: number,
    end_time: number,
    creator_balance: [{
        amount: string,
        denom: string
    }],
    asking_price: {
        amount: string,
        denom: string
    },
    recipient_balance: [{
        amount: string,
        denom: string
    }],
    status: string
}

/**
 * @property baseAmount The An amount of tokens in a wallet, expressed in the base denom. This value is returned by the chain.
 * @property baseDenom The base denom of the token. Eg: uKuji
 * @property display The text that can be used in the UI for this token.
 * @property exponent The relationship between the base denom and the symbol denom. We referred to this as "decimals" previously.
 * @property name The name of the token/project.
 * @property symbol The ticker symbol of the token. Eg: KUJI
 * @property symbolAmount An amount of tokens in a wallet, expressed in the symbol denom. This is a calculated value using the baseAmount and the exponent properties.
 * @property symbolPng A link to a png of the token symbol. This property is not guaranteed to be defined for all tokens.
 * @property symbolSvg A link to an svg of the token symbol. This property is not guaranteed to be defined for all tokens.
 * @property transactDenom The denom to use when creating transactions.
 */
export type RichTokenBalance = {
    baseAmount: number,
    baseDenom: string,
    display: string,
    exponent: number
    name: string,
    symbol: string,
    symbolAmount: number,
    symbolPng: string,
    symbolSvg: string,
    transactDenom:string
}

/**
 * Represents an Escrow on chain.
 * @property id A unique identifier for an Escrow.
 * @property creator The wallet address of the person creating the Escrow.
 * @property created_at When the Escrow was created, in Epoch format.
 * @property arbiter The wallet address of a 3rd party who will oversee completion of the Escrow.
 * @property recipient The wallet address of the person who will be filling the other side of the Escrow.
 * @property title A title for the Escrow.
 * @property description A description for the Escrow.
 * @property end_height An
 * @property end_time An
 * @property creator_balance The balance deposited by the creator side of the Escrow.
 * @property asking_price The asking price for the assets in the Escrow. This is proposed by the creator of the Escrow.
 * @property recipient_balance The balance deposited by the receiving side of the Escrow.
 * @property status The status of an Escrow.
 */
export type RichEscrowDetails = {
    id: number,
    creator: string,
    createdAt: number,
    arbiter: string,
    recipient: string,
    title: string,
    description: string,
    endHeight: number,
    endTime: number,
    creatorBalance: RichTokenBalance[],
    askingPrice: RichTokenBalance
    recipientBalance: RichTokenBalance[],
    status: string
}

export type OtcConfigAndPending = {
    config: OtcConfig;
    pending_config: OtcConfig;
}

/**
 * Provides a count of Escrows for a token pair combination.
 * @property denom1 One of the tokens in the pair.
 * @property denom2 The other token in the pair.
 * @property count The number of Escrows for the pair.
 */
export type PairCount = {
    denom1:string,
    denom2:string,
    count:number
}