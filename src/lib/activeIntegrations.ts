import { activeProviders, ProviderIdentifier } from "@/lib/providers/active";
import { BrpSubdomain, DetailedBrpWeekSchedule } from "@/lib/providers/brpsystems/types";
import { IBookingDomain, IBookingWeekSchedule } from "@/lib/providers/ibooking/types";
import { checkSantaTime } from "@/lib/utils/santaUtils";
import { RezervoIntegration } from "@/types/integration";

const isSantaTime = checkSantaTime();

export enum IntegrationIdentifier {
    sit = "sit",
    fsc = "fsc",
    ttt = "3t",
}

const activeIntegrations: {
    [IntegrationIdentifier.sit]: RezervoIntegration<IBookingWeekSchedule>;
    [IntegrationIdentifier.fsc]: RezervoIntegration<DetailedBrpWeekSchedule>;
    [IntegrationIdentifier.ttt]: RezervoIntegration<DetailedBrpWeekSchedule>;
} = {
    [IntegrationIdentifier.sit]: {
        profile: {
            identifier: IntegrationIdentifier.sit,
            name: "Sit Trening",
            images: {
                light: {
                    largeLogo: `/integrations/sit/light/logo_large${isSantaTime ? "_santa.png" : ".svg"}`,
                },
                dark: {
                    largeLogo: `/integrations/sit/dark/logo_large${isSantaTime ? "_santa.png" : ".svg"}`,
                },
                common: {
                    smallLogo: `/integrations/sit/common/logo_small${isSantaTime ? "_santa" : ""}.png`,
                },
            },
        },
        businessUnits: [
            {
                name: "Trondheim",
            },
        ],
        provider: activeProviders[ProviderIdentifier.ibooking](IBookingDomain.sit),
    },
    [IntegrationIdentifier.fsc]: {
        profile: {
            identifier: IntegrationIdentifier.fsc,
            name: "Family Sports Club",
            images: {
                light: {
                    largeLogo: `/integrations/fsc/light/logo_large${isSantaTime ? "_santa.png" : ".svg"}`,
                },
                dark: {
                    largeLogo: `/integrations/fsc/dark/logo_large${isSantaTime ? "_santa.png" : ".svg"}`,
                },
                common: {
                    smallLogo: `/integrations/fsc/common/logo_small${isSantaTime ? "_santa" : ""}.png`,
                },
            },
        },
        businessUnits: [
            {
                name: "Ski",
            },
        ],
        provider: activeProviders[ProviderIdentifier.brpsystems](BrpSubdomain.fsc, 8),
    },
    [IntegrationIdentifier.ttt]: {
        profile: {
            identifier: IntegrationIdentifier.ttt,
            name: "3T",
            images: {
                light: {
                    largeLogo: `/integrations/3t/light/logo_large${isSantaTime ? "_santa.png" : ".svg"}`,
                },
                dark: {
                    largeLogo: `/integrations/3t/dark/logo_large${isSantaTime ? "_santa.png" : ".svg"}`,
                },
                common: {
                    smallLogo: `/integrations/3t/common/logo_small${isSantaTime ? "_santa" : ""}.png`,
                },
            },
        },
        businessUnits: [
            {
                name: "Rosten",
            },
        ],
        provider: activeProviders[ProviderIdentifier.brpsystems](BrpSubdomain.ttt, 1),
    },
};

export default activeIntegrations;
