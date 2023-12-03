import { activeProviders, ProviderIdentifier } from "@/lib/providers/active";
import { BrpSubdomain, DetailedBrpWeekSchedule } from "@/lib/providers/brpsystems/types";
import { IBookingDomain, IBookingWeekSchedule } from "@/lib/providers/ibooking/types";
import { checkSantaTime } from "@/lib/utils/santaUtils";
import { RezervoChain } from "@/types/chain";

const isSantaTime = checkSantaTime();

export enum ChainIdentifier {
    sit = "sit",
    fsc = "fsc",
    ttt = "3t",
}

const activeChains: {
    [ChainIdentifier.sit]: RezervoChain<IBookingWeekSchedule>;
    [ChainIdentifier.fsc]: RezervoChain<DetailedBrpWeekSchedule>;
    [ChainIdentifier.ttt]: RezervoChain<DetailedBrpWeekSchedule>;
} = {
    [ChainIdentifier.sit]: {
        profile: {
            identifier: ChainIdentifier.sit,
            name: "Sit Trening",
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
        branches: [
            {
                name: "Trondheim",
                locations: [
                    {
                        name: "Gløshaugen",
                    },
                    {
                        name: "Portalen",
                    },
                    {
                        name: "Dragvoll",
                    },
                    {
                        name: "DMMH",
                    },
                ],
            },
        ],
        provider: activeProviders[ProviderIdentifier.ibooking](IBookingDomain.sit),
    },
    [ChainIdentifier.fsc]: {
        profile: {
            identifier: ChainIdentifier.fsc,
            name: "Family Sports Club",
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
        branches: [
            {
                name: "Ski",
                locations: [
                    {
                        name: "Ski",
                    },
                ],
            },
        ],
        provider: activeProviders[ProviderIdentifier.brpsystems](BrpSubdomain.fsc, 8),
    },
    [ChainIdentifier.ttt]: {
        profile: {
            identifier: ChainIdentifier.ttt,
            name: "3T",
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
        branches: [
            {
                name: "Trondheim",
                locations: [
                    {
                        name: "Fossegrenda",
                    },
                    {
                        name: "Rosten",
                    },
                ],
            },
        ],
        provider: activeProviders[ProviderIdentifier.brpsystems](BrpSubdomain.ttt, 1),
    },
};

export default activeChains;
