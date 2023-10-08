import { IntegrationIdentifier } from "@/lib/activeIntegrations";
import { brpToRezervoWeekSchedule } from "@/lib/providers/brpsystems/adapters";
import { fetchBrpWeekSchedule } from "@/lib/providers/brpsystems/fetchers";
import { DetailedBrpWeekSchedule } from "@/lib/providers/brpsystems/types";
import { iBookingToRezervoWeekSchedule } from "@/lib/providers/ibooking/adapters";
import { fetchIBookingWeekSchedule } from "@/lib/providers/ibooking/fetchers";
import { IBookingWeekSchedule } from "@/lib/providers/ibooking/types";
import { GenericRezervoProvider, RezervoProvider } from "@/types/integration";

export enum ProviderIdentifier {
    ibooking = "ibooking",
    brpsystems = "brpsystems",
}

export function createProvider<T>(
    provider: GenericRezervoProvider<T>,
    integration: IntegrationIdentifier,
    businessUnit: number,
): RezervoProvider<T> {
    return {
        weekScheduleFetcher: (weekNumber: number) =>
            provider.weekScheduleFetcher(weekNumber, integration, businessUnit),
        weekScheduleAdapter: (weekSchedule: T) => provider.weekScheduleAdapter(weekSchedule, integration),
    };
}

export const activeProviders: {
    [ProviderIdentifier.ibooking]: GenericRezervoProvider<IBookingWeekSchedule>;
    [ProviderIdentifier.brpsystems]: GenericRezervoProvider<DetailedBrpWeekSchedule>;
} = {
    [ProviderIdentifier.ibooking]: {
        weekScheduleFetcher: fetchIBookingWeekSchedule,
        weekScheduleAdapter: iBookingToRezervoWeekSchedule,
    },
    [ProviderIdentifier.brpsystems]: {
        weekScheduleFetcher: fetchBrpWeekSchedule,
        weekScheduleAdapter: brpToRezervoWeekSchedule,
    },
};
