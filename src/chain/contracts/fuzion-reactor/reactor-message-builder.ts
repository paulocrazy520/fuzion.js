
const getUpdateAdminMessage = (adminAddress:string):Record<string, unknown> => {
    const msg = {
        update_admin: {
            admin: adminAddress
        }

    }

    return msg
}

const getFundsDepositMessage = ():Record<string, unknown> => {
    const msg = {
        funds_deposit: {}
    }

    return msg
}

const getFundsUnbondMessage = (tokens:number):Record<string, unknown> => {
    const msg = {
        funds_unbond: {
            tokens:tokens //todo: make sure this is compatible with Uint128
        }
    }

    return msg
}

const getFundsWithdrawMessage = ():Record<string, unknown> => {
    const msg = {
        funds_withdraw: {}
    }

    return msg
}

const getFundsClaimMessage = ():Record<string, unknown> => {
    const msg = {
        funds_claim: {}
    }

    return msg
}

const getTokensDepositMessage = ():Record<string, unknown> => {
    const msg = {
        tokens_deposit: {}
    }

    return msg
}

const getTokensClaimMessage = ():Record<string, unknown> => {
    const msg = {
        tokens_claim: {}
    }

    return msg
}