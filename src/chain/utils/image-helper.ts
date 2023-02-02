import {LogoURIs} from "../types/image-types";

export class ImageHelper {

    public static getChainLogos = (chainName: string): LogoURIs => {
        if (chainName.toLowerCase() === 'kujira') {
            return {
                png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kujira-chain-logo.png',
                svg: undefined
            }
        }

        return {
            png:undefined,
            svg:undefined
        }
    }
}