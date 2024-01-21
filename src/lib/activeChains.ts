import { fetchActiveChains } from "@/lib/helpers/fetchers";
import { checkSantaTime } from "@/lib/utils/santaUtils";
import { BaseRezervoChain, RezervoChain, RezervoChainExtras } from "@/types/chain";

const isSantaTime = checkSantaTime();

export enum ChainIdentifier {
    sit = "sit",
    fsc = "fsc",
    ttt = "3t",
}

let baseActiveChains: BaseRezervoChain[] | undefined = undefined;

const chainExtras: { [identifier in ChainIdentifier]: RezervoChainExtras } = {
    [ChainIdentifier.sit]: {
        profile: {
            images: {
                light: {
                    largeLogo: `/chains/sit/light/logo_large${isSantaTime ? "_santa.png" : ".svg"}`,
                },
                dark: {
                    largeLogo: `/chains/sit/dark/logo_large${isSantaTime ? "_santa.png" : ".svg"}`,
                },
                common: {
                    smallLogo: `/chains/sit/common/logo_small${isSantaTime ? "_santa" : ""}.png`,
                },
            },
        },
    },
    [ChainIdentifier.fsc]: {
        profile: {
            images: {
                light: {
                    largeLogo: `/chains/fsc/light/logo_large${isSantaTime ? "_santa.png" : ".svg"}`,
                },
                dark: {
                    largeLogo: `/chains/fsc/dark/logo_large${isSantaTime ? "_santa.png" : ".svg"}`,
                },
                common: {
                    smallLogo: `/chains/fsc/common/logo_small${isSantaTime ? "_santa" : ""}.png`,
                },
            },
        },
    },
    [ChainIdentifier.ttt]: {
        profile: {
            images: {
                light: {
                    largeLogo: `/chains/3t/light/logo_large${isSantaTime ? "_santa" : ""}.png`,
                },
                dark: {
                    largeLogo: `/chains/3t/dark/logo_large${isSantaTime ? "_santa" : ""}.png`,
                },
                common: {
                    smallLogo: `/chains/3t/common/logo_small${isSantaTime ? "_santa" : ""}.png`,
                },
            },
        },
    },
};

async function getBaseActiveChains(): Promise<BaseRezervoChain[]> {
    if (baseActiveChains == undefined) {
        baseActiveChains = await fetchActiveChains();
    }
    return baseActiveChains;
}

export async function getChains(): Promise<RezervoChain[]> {
    return (await getBaseActiveChains()).map((chain) => ({
        ...chain,
        profile: {
            ...chain.profile,
            ...chainExtras[chain.profile.identifier].profile,
        },
    }));
}

export async function getChainIdentifiers(): Promise<ChainIdentifier[]> {
    return (await getBaseActiveChains()).map((chain) => chain.profile.identifier);
}

let activeChainsMap: Map<ChainIdentifier, RezervoChain> | undefined = undefined;

export async function getActiveChainsMap(): Promise<Map<ChainIdentifier, RezervoChain>> {
    if (activeChainsMap == undefined) {
        const chains = await getChains();
        activeChainsMap = new Map(chains.map((chain) => [chain.profile.identifier, chain]));
    }
    return activeChainsMap;
}

export async function getChain(identifier: ChainIdentifier): Promise<RezervoChain> {
    const chain = (await getActiveChainsMap()).get(identifier);
    if (chain == undefined) throw new Error(`Chain ${identifier} not found`);
    return chain;
}
