import { brpToRezervoWeekSchedule } from "@/lib/providers/brpsystems/adapters";
import { fetchBrpWeekSchedule } from "@/lib/providers/brpsystems/fetchers";
import { DetailedBrpWeekSchedule } from "@/lib/providers/brpsystems/types";
import { iBookingToRezervoWeekSchedule } from "@/lib/providers/ibooking/adapters";
import { fetchIBookingWeekSchedule } from "@/lib/providers/ibooking/fetchers";
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
                name: "Trondheim",
                weekScheduleFetcher: (weekNumber: number) =>
                    fetchIBookingWeekSchedule(weekNumber, IntegrationIdentifier.sit),
                weekScheduleAdapter: (iBookingWeekSchedule: IBookingWeekSchedule) =>
                    iBookingToRezervoWeekSchedule(iBookingWeekSchedule, IntegrationIdentifier.sit),
            },
        ],
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
                weekScheduleFetcher: (weekNumber: number) =>
                    fetchBrpWeekSchedule(weekNumber, IntegrationIdentifier.fsc),
                weekScheduleAdapter: (brpWeekSchedule: DetailedBrpWeekSchedule) =>
                    brpToRezervoWeekSchedule(brpWeekSchedule, IntegrationIdentifier.fsc),
            },
        ],
    },
};

export default activeIntegrations;
