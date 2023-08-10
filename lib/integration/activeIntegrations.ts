import { fetchSitWeekSchedule } from "./sit";
import { fetchFscWeekSchedule } from "./fsc";

// eslint-disable-next-line no-unused-vars
const activeIntegrations: { [identifier in IntegrationIdentifier]: RezervoIntegration } = {
    [IntegrationIdentifier.sit]: {
        name: "Sit Trening",
        acronym: IntegrationIdentifier.sit,
        logo: "https://www.sit.no/sites/all/themes/sit_2017/resources/svg/sit-logo-standard.svg",
        businessUnits: [
            {
                name: "Trondheim",
                weekScheduleFetcher: fetchSitWeekSchedule,
            },
        ],
    },
    [IntegrationIdentifier.fsc]: {
        name: "Family Sports Club",
        acronym: IntegrationIdentifier.fsc,
        logo: "https://www.fsc.no/img/logo-fsc.svg",
        businessUnits: [
            {
                name: "Ski",
                weekScheduleFetcher: fetchFscWeekSchedule,
            },
        ],
    },
};

export default activeIntegrations;
