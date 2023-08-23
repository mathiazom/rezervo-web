import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import React from "react";

import Integration from "../components/Integration";
import { activeIntegrations, fetchIntegrationPageStaticProps } from "../lib/integration/common";
import { IntegrationIdentifier, IntegrationPageProps, RezervoBusinessUnit } from "../types/rezervo";

export const getStaticPaths: GetStaticPaths<{ integrationIdentifier: string }> = async () => {
    return {
        paths: Object.keys(IntegrationIdentifier).map((integrationIdentifier) => ({
            params: { integrationIdentifier },
        })),
        fallback: false,
    };
};
export const getStaticProps: GetStaticProps = async ({
    params,
}): Promise<{
    revalidate: number;
    props: IntegrationPageProps;
}> => {
    const integrationIdentifier = String(params?.["integrationIdentifier"]) as IntegrationIdentifier;
    const integration = activeIntegrations[integrationIdentifier];

    if (!integration) {
        throw new Error(`${integrationIdentifier} is not a valid identifier for any active integrations`);
    }

    const businessUnit = integration.businessUnits[0];
    if (!businessUnit) {
        throw new Error(`${integration.name} does not have any business units`);
    }

    return await fetchIntegrationPageStaticProps(
        businessUnit as unknown as RezervoBusinessUnit<typeof businessUnit.weekScheduleFetcher>,
        integration.acronym,
    );
};
const IntegrationPage: NextPage<IntegrationPageProps> = ({
    initialSchedule,
    classPopularityIndex,
    integrationAcronym,
}) => {
    return (
        <Integration
            initialSchedule={initialSchedule}
            classPopularityIndex={classPopularityIndex}
            acronym={integrationAcronym}
        />
    );
};

export default IntegrationPage;
