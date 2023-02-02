/**
 * @property amount An amount of tokens.
 * @property denom The denom of the balance.
 */
export type WalletBalance = {
    amount: string,
    denom: string
}

/**
 * Represents the properties of a token, as it is defined on chain.
 * @property transactDenom The denom to use when creating transactions.
 * @property chainName The name of the chain where the token is from.
 * @property baseDenom The base denom of the token. Eg: uKuji
 * @property display The text that can be used in the UI for this token.
 * @property exponent The relationship between the base denom and the symbol denom. We referred to this as "decimals" previously.
 * @property name The name of the token/project.
 * @property symbol The ticker symbol of the token. Eg: KUJI
 * @property symbolPng A link to a png of the token symbol. This property is not guaranteed to be defined for all tokens.
 * @property symbolSvg link to an svg of the token symbol. This property is not guaranteed to be defined for all tokens.
 */
export type TokenProperties = {
    transactDenom:string,
    chainName: string
    baseDenom: string,
    display: string,
    exponent: number
    name: string,
    symbol: string,
    symbolPng: string,
    symbolSvg: string
}

/**
 *
 * @property transactDenom The denom to use when creating transactions.
 * @property baseAmount The An amount of tokens in a wallet, expressed in the base denom. This value is returned by the chain.
 * @property baseDenom The base denom of the token. Eg: uKuji
 * @property display The text that can be used in the UI for this token.
 * @property exponent The relationship between the base denom and the symbol denom. We referred to this as "decimals" previously.
 * @property name The name of the token/project.
 * @property symbol The ticker symbol of the token. Eg: KUJI
 * @property symbolAmount An amount of tokens in a wallet, expressed in the symbol denom. This is a calculated value using the baseAmount and the exponent properties.
 * @property symbolPng A link to a png of the token symbol. This property is not guaranteed to be defined for all tokens.
 * @property symbolSvg A link to an svg of the token symbol. This property is not guaranteed to be defined for all tokens.
 */
export type WalletTokenBalance = {
    transactDenom:string,
    baseAmount: number,
    baseDenom: string,
    display: string,
    exponent: number
    name: string,
    symbol: string,
    symbolAmount: number,
    symbolPng: string,
    symbolSvg: string
}