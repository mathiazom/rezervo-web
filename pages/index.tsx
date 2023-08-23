import type { NextPage } from "next";
import React from "react";

import Integration from "../components/Integration";
import { activeIntegrations, fetchIntegrationPageStaticProps } from "../lib/integration/common";
import { IntegrationPageProps, RezervoBusinessUnit } from "../types/rezervo";

export async function getStaticProps(): Promise<{
    revalidate: number;
    props: IntegrationPageProps;
}> {
    const integration = activeIntegrations.sit;
    const businessUnit = integration.businessUnits[0];
    if (!businessUnit) {
        throw new Error(`${integration.name} does not have any business units`);
    }

    return await fetchIntegrationPageStaticProps(
        businessUnit as unknown as RezervoBusinessUnit<typeof businessUnit.weekScheduleFetcher>,
        integration.acronym,
    );
}

const Index: NextPage<IntegrationPageProps> = ({ initialSchedule, classPopularityIndex, integrationAcronym }) => {
    return (
        <Integration
            initialSchedule={initialSchedule}
            classPopularityIndex={classPopularityIndex}
            acronym={integrationAcronym}
        />
    );
};

export default Index;
