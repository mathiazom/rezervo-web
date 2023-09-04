import type { GetStaticPaths, NextPage } from "next";
import React from "react";

import Integration from "@/components/Integration";
import { fetchIntegrationPageStaticProps } from "@/lib/helpers/fetchers";
import activeIntegrations from "@/lib/integrations/active";
import { deserializeSchedule } from "@/lib/serialization/deserializers";
import { IntegrationPageParams, RezervoIntegration } from "@/types/rezervo";
import { IntegrationPageProps } from "@/types/serialization";

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: Object.keys(activeIntegrations).map((integration) => ({
            params: {
                integration,
            },
        })),
        fallback: false,
    };
};

export async function getStaticProps({ params }: { params: IntegrationPageParams }): Promise<{
    revalidate: number;
    props: IntegrationPageProps;
}> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const integration: RezervoIntegration<any> = activeIntegrations[params.integration];
    const businessUnit = integration.businessUnits[0];
    if (!businessUnit) {
        throw new Error(`${integration.profile.name} does not have any business units`);
    }
    return await fetchIntegrationPageStaticProps(integration.profile, businessUnit);
}

const IntegrationPage: NextPage<IntegrationPageProps> = ({
    integrationProfile,
    initialSchedule,
    classPopularityIndex,
}) => {
    return (
        <Integration
            initialSchedule={deserializeSchedule(initialSchedule)}
            classPopularityIndex={classPopularityIndex}
            integrationProfile={integrationProfile}
        />
    );
};

export default IntegrationPage;
