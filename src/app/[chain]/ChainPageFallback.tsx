"use client";

import { Box, Divider, Stack } from "@mui/material";

import WeekNavigatorSkeleton from "@/components/schedule/WeekNavigatorSkeleton";
import WeekScheduleSkeleton from "@/components/schedule/WeekScheduleSkeleton";
import AppBarSkeleton from "@/components/utils/AppBarSkeleton";
import { compactISOWeekString, firstDateOfWeekByOffset, LocalizedDateTime } from "@/lib/helpers/date";

export default function ChainPageFallback() {
    const currentWeek = compactISOWeekString(firstDateOfWeekByOffset(LocalizedDateTime.now(), 0));
    return (
        <Stack sx={{ height: "100%", overflow: "hidden" }}>
            <Box sx={{ flexShrink: 0 }}>
                <AppBarSkeleton />
                <WeekNavigatorSkeleton />
                <Divider orientation="horizontal" />
            </Box>
            <WeekScheduleSkeleton weekParam={currentWeek} />
        </Stack>
    );
}
