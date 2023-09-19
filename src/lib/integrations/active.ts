import { fscToRezervoWeekSchedule } from "@/lib/integrations/fsc/adapters";
import { fetchFscWeekSchedule } from "@/lib/integrations/fsc/fetchers";
import { DetailedFscWeekSchedule } from "@/lib/integrations/fsc/types";
import { sitToRezervoWeekSchedule } from "@/lib/integrations/sit/adapters";
import { fetchSitWeekSchedule } from "@/lib/integrations/sit/fetchers";
import { SitWeekSchedule } from "@/lib/integrations/sit/types";
import { RezervoIntegration } from "@/types/integration";

export enum IntegrationIdentifier {
    sit = "sit",
    fsc = "fsc",
}

export type IntegrationWeekSchedule = {
    [IntegrationIdentifier.sit]: SitWeekSchedule;
    [IntegrationIdentifier.fsc]: DetailedFscWeekSchedule;
};

const activeIntegrations: {
    [identifier in IntegrationIdentifier]: RezervoIntegration<IntegrationWeekSchedule[identifier]>;
} = {
    [IntegrationIdentifier.sit]: {
        profile: {
            acronym: IntegrationIdentifier.sit,
            name: "Sit Trening",
            logo: {
                small: "/integrations/sit/logo_small.png",
                large: "/integrations/sit/logo_large.png",
            },
        },
        businessUnits: [
            {
                name: "Trondheim",
                weekScheduleFetcher: fetchSitWeekSchedule,
                weekScheduleAdapter: sitToRezervoWeekSchedule,
            },
        ],
    },
    [IntegrationIdentifier.fsc]: {
        profile: {
            acronym: IntegrationIdentifier.fsc,
            name: "Family Sports Club",
            logo: {
                small: "/integrations/fsc/logo_small.png",
                large: "/integrations/fsc/logo_large.png",
            },
        },
        businessUnits: [
            {
                name: "Ski",
                weekScheduleFetcher: fetchFscWeekSchedule,
                weekScheduleAdapter: fscToRezervoWeekSchedule,
            },
        ],
    },
};

export default activeIntegrations;
