import type { GetStaticPaths, NextPage } from "next";
import React from "react";

import Integration from "@/components/Integration";
import { activeIntegrations, fetchIntegrationPageStaticProps } from "@/lib/integration/common";
import { deserializeSchedule } from "@/lib/serializers";
import { IntegrationPageParams, IntegrationPageProps, RezervoIntegration } from "@/types/rezervo";

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
        throw new Error(`${integration.name} does not have any business units`);
    }
    return await fetchIntegrationPageStaticProps(params.integration, businessUnit);
}

const IntegrationPage: NextPage<IntegrationPageProps> = ({ integration, initialSchedule, classPopularityIndex }) => {
    return (
        <Integration
            initialSchedule={deserializeSchedule(initialSchedule)}
            classPopularityIndex={classPopularityIndex}
            integration={integration}
        />
    );
};

export default IntegrationPage;
