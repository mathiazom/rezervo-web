"use client";

import WeekScheduleSkeleton from "@/components/schedule/WeekScheduleSkeleton";
import { compactISOWeekString, firstDateOfWeekByOffset, LocalizedDateTime } from "@/lib/helpers/date";

export default function ChainPageFallback() {
    const currentWeek = compactISOWeekString(firstDateOfWeekByOffset(LocalizedDateTime.now(), 0));
    return <WeekScheduleSkeleton weekParam={currentWeek} />;
}
