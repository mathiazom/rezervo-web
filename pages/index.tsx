import type { NextPage } from "next";
import React from "react";
import { fetchSitWeekSchedule } from "../lib/integration/sit";
import { ClassPopularityIndex, RezervoSchedule } from "../types/rezervo";
import { createClassPopularityIndex } from "../lib/popularity";
import Integration from "../components/Integration";
import { fetchRezervoSchedule } from "../lib/integration/common";
import { sitToRezervoWeekSchedule } from "../lib/integration/adapters";

export async function getStaticProps() {
    const initialSchedule = await fetchRezervoSchedule(
        [-1, 0, 1, 2, 3],
        fetchSitWeekSchedule,
        sitToRezervoWeekSchedule
    );
    const classPopularityIndex = createClassPopularityIndex(initialSchedule[-1]!);
    const invalidationTimeInSeconds = 60 * 60;

    return {
        props: {
            initialSchedule,
            classPopularityIndex,
        },
        revalidate: invalidationTimeInSeconds,
    };
}

const Index: NextPage<{
    initialSchedule: RezervoSchedule;
    classPopularityIndex: ClassPopularityIndex;
}> = ({ initialSchedule, classPopularityIndex }) => {
    return (
        <Integration initialSchedule={initialSchedule} classPopularityIndex={classPopularityIndex} acronym={"sit"} />
    );
};

export default Index;
