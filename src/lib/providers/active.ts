import { brpToRezervoWeekSchedule } from "@/lib/providers/brpsystems/adapters";
import { fetchBrpWeekSchedule } from "@/lib/providers/brpsystems/fetchers";
import { DetailedBrpWeekSchedule, BrpSubdomain } from "@/lib/providers/brpsystems/types";
import { iBookingToRezervoWeekSchedule } from "@/lib/providers/ibooking/adapters";
import { fetchIBookingWeekSchedule } from "@/lib/providers/ibooking/fetchers";
import { IBookingDomain, IBookingWeekSchedule } from "@/lib/providers/ibooking/types";
import { RezervoProvider } from "@/types/chain";

export enum ProviderIdentifier {
    ibooking = "ibooking",
    brpsystems = "brpsystems",
}

export const activeProviders: {
    [ProviderIdentifier.ibooking]: (domain: IBookingDomain) => RezervoProvider<IBookingWeekSchedule>;
    [ProviderIdentifier.brpsystems]: (
        subdomain: BrpSubdomain,
        businessUnit: number,
    ) => RezervoProvider<DetailedBrpWeekSchedule>;
} = {
    [ProviderIdentifier.ibooking]: (domain) => ({
        weekScheduleFetcher: (weekOffset) => fetchIBookingWeekSchedule(weekOffset, domain),
        weekScheduleAdapter: (weekSchedule) => iBookingToRezervoWeekSchedule(weekSchedule),
    }),
    [ProviderIdentifier.brpsystems]: (subdomain, businessUnit) => ({
        weekScheduleFetcher: (weekOffset) => fetchBrpWeekSchedule(weekOffset, subdomain, businessUnit),
        weekScheduleAdapter: (weekSchedule) => brpToRezervoWeekSchedule(weekSchedule),
    }),
};
