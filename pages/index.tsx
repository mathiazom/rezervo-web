import type { NextPage } from "next";
import React from "react";
import { fetchSitSchedule } from "../lib/integration/sit";
import { SitWeekSchedule } from "../types/integration/sit";
import { ClassPopularityIndex } from "../types/rezervo";
import { createClassPopularityIndex } from "../lib/popularity";
import Integration from "../components/Integration";

export async function getStaticProps() {
    const initialCachedSchedules = await fetchSitSchedule([-1, 0, 1, 2, 3]);
    const classPopularityIndex = await createClassPopularityIndex(initialCachedSchedules[-1]!);
    const invalidationTimeInSeconds = 60 * 60;

    return {
        props: {
            initialCachedSchedules,
            classPopularityIndex,
        },
        revalidate: invalidationTimeInSeconds,
    };
}

const Index: NextPage<{
    initialCachedSchedules: { [weekOffset: number]: SitWeekSchedule };
    classPopularityIndex: ClassPopularityIndex;
}> = ({ initialCachedSchedules, classPopularityIndex }) => {
    return (
        <Integration
            initialSchedule={initialCachedSchedules}
            classPopularityIndex={classPopularityIndex}
            acronym={"sit"}
        />
    );
};

export default Index;
