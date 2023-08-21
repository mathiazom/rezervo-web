import type { NextPage } from "next";
import React from "react";
import { IntegrationPageProps } from "../types/rezervo";
import Integration from "../components/Integration";
import { activeIntegrations, fetchIntegrationPageStaticProps } from "../lib/integration/common";

const integration = activeIntegrations.sit;

export async function getStaticProps(): Promise<{
    revalidate: number;
    props: IntegrationPageProps;
}> {
    const businessUnit = integration.businessUnits[0];
    if (!businessUnit) {
        throw new Error(`${integration.name} does not have any business units`);
    }
    return await fetchIntegrationPageStaticProps(businessUnit.weekScheduleFetcher, businessUnit.weekScheduleAdapter);
}

const Index: NextPage<IntegrationPageProps> = ({ initialSchedule, classPopularityIndex }) => {
    return (
        <Integration
            initialSchedule={initialSchedule}
            classPopularityIndex={classPopularityIndex}
            acronym={integration.acronym}
        />
    );
};

export default Index;
