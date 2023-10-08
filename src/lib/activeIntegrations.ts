import { activeProviders, createProvider, ProviderIdentifier } from "@/lib/providers/active";
import { DetailedBrpWeekSchedule } from "@/lib/providers/brpsystems/types";
import { IBookingWeekSchedule } from "@/lib/providers/ibooking/types";
import { RezervoIntegration } from "@/types/integration";

export enum IntegrationIdentifier {
    sit = "sit",
    fsc = "fsc",
    tret = "3t",
}

const activeIntegrations: {
    [IntegrationIdentifier.sit]: RezervoIntegration<IBookingWeekSchedule>;
    [IntegrationIdentifier.fsc]: RezervoIntegration<DetailedBrpWeekSchedule>;
    [IntegrationIdentifier.tret]: RezervoIntegration<DetailedBrpWeekSchedule>;
} = {
    [IntegrationIdentifier.sit]: {
        profile: {
            acronym: IntegrationIdentifier.sit,
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
        provider: createProvider(activeProviders.ibooking, IntegrationIdentifier.sit, 0),
    },
    [IntegrationIdentifier.fsc]: {
        profile: {
            acronym: IntegrationIdentifier.fsc,
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
        provider: createProvider(activeProviders.brpsystems, IntegrationIdentifier.fsc, 8),
    },
    [IntegrationIdentifier.tret]: {
        profile: {
            acronym: IntegrationIdentifier.tret,
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
                name: "Fossegrenda",
            },
        ],
        provider: createProvider(activeProviders[ProviderIdentifier.brpsystems], IntegrationIdentifier.tret, 5860),
    },
};

export default activeIntegrations;
