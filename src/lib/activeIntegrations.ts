import { activeProviders } from "@/lib/providers/active";
import { DetailedBrpWeekSchedule } from "@/lib/providers/brpsystems/types";
import { IBookingWeekSchedule } from "@/lib/providers/ibooking/types";
import { RezervoIntegration } from "@/types/integration";

export enum IntegrationIdentifier {
    sit = "sit",
    fsc = "fsc",
}

export type IntegrationWeekSchedule = {
    [IntegrationIdentifier.sit]: IBookingWeekSchedule;
    [IntegrationIdentifier.fsc]: DetailedBrpWeekSchedule;
};

const activeIntegrations: {
    [identifier in IntegrationIdentifier]: RezervoIntegration<IntegrationWeekSchedule[identifier]>;
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
                id: 0,
                name: "Trondheim",
            },
        ],
        provider: activeProviders.ibooking,
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
                id: 8,
                name: "Ski",
            },
        ],
        provider: activeProviders.brpsystems,
    },
};

export default activeIntegrations;
