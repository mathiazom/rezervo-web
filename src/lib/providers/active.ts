import { brpToRezervoWeekSchedule } from "@/lib/providers/brpsystems/adapters";
import { fetchBrpWeekSchedule } from "@/lib/providers/brpsystems/fetchers";
import { DetailedBrpWeekSchedule } from "@/lib/providers/brpsystems/types";
import { iBookingToRezervoWeekSchedule } from "@/lib/providers/ibooking/adapters";
import { fetchIBookingWeekSchedule } from "@/lib/providers/ibooking/fetchers";
import { IBookingWeekSchedule } from "@/lib/providers/ibooking/types";
import { RezervoProvider } from "@/types/integration";

export enum ProviderIdentifier {
    ibooking = "ibooking",
    brp = "brpsystems",
}

export type ProviderWeekSchedule = {
    [ProviderIdentifier.ibooking]: IBookingWeekSchedule;
    [ProviderIdentifier.brp]: DetailedBrpWeekSchedule;
};

export const activeProviders: {
    [identifier in ProviderIdentifier]: RezervoProvider<ProviderWeekSchedule[identifier]>;
} = {
    ibooking: {
        weekScheduleFetcher: fetchIBookingWeekSchedule,
        weekScheduleAdapter: iBookingToRezervoWeekSchedule,
    },
    brpsystems: {
        weekScheduleFetcher: fetchBrpWeekSchedule,
        weekScheduleAdapter: brpToRezervoWeekSchedule,
    },
};
