import { activeProviders, ProviderIdentifier } from "@/lib/providers/active";
import { BrpSubdomain, DetailedBrpWeekSchedule } from "@/lib/providers/brpsystems/types";
import { IBookingDomain, IBookingWeekSchedule } from "@/lib/providers/ibooking/types";
import { RezervoIntegration } from "@/types/integration";

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
                    largeLogo: "/integrations/sit/light/logo_large.svg",
                },
                dark: {
                    largeLogo: "/integrations/sit/dark/logo_large.svg",
                },
                common: {
                    smallLogo: "/integrations/sit/common/logo_small.png",
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
                    largeLogo: "/integrations/fsc/light/logo_large.svg",
                },
                dark: {
                    largeLogo: "/integrations/fsc/dark/logo_large.svg",
                },
                common: {
                    smallLogo: "/integrations/fsc/common/logo_small.png",
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
                    largeLogo: "/integrations/3t/light/logo_large.png",
                },
                dark: {
                    largeLogo: "/integrations/3t/dark/logo_large.png",
                },
                common: {
                    smallLogo: "/integrations/3t/common/logo_small.png",
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
