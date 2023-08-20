import type { NextPage } from "next";
import React from "react";
import { fetchSitWeekSchedule } from "../lib/integration/sit";
import { IntegrationPageProps } from "../types/rezervo";
import Integration from "../components/Integration";
import { fetchIntegrationPageStaticProps } from "../lib/integration/common";
import { sitToRezervoWeekSchedule } from "../lib/integration/adapters";

export async function getStaticProps(): Promise<{
    revalidate: number;
    props: IntegrationPageProps;
}> {
    return await fetchIntegrationPageStaticProps(fetchSitWeekSchedule, sitToRezervoWeekSchedule);
}

const Index: NextPage<IntegrationPageProps> = ({ initialSchedule, classPopularityIndex }) => {
    return (
        <Integration initialSchedule={initialSchedule} classPopularityIndex={classPopularityIndex} acronym={"sit"} />
    );
};

export default Index;
