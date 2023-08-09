import type { NextPage } from "next";
import React from "react";
import { fetchSchedules } from "../lib/integration/sit";
import { SitWeekSchedule } from "../types/integration/sit";
import { ClassPopularityIndex } from "../types/rezervo";
import { createClassPopularityIndex } from "../lib/popularity";
import Integration from "../components/Integration";

export async function getStaticProps() {
    const initialCachedSchedules = await fetchSchedules([-1, 0, 1, 2, 3]);
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
            initialCachedSchedules={initialCachedSchedules}
            classPopularityIndex={classPopularityIndex}
            acronym={"sit"}
        />
    );
};

export default Index;
