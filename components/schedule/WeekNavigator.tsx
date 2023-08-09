import LoadingButton from "@mui/lab/LoadingButton";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import React, { Dispatch, SetStateAction, useState } from "react";
import { SitSchedule } from "../../types/integration/sit";
import { DateTime } from "luxon";

export default function WeekNavigator({
    initialCachedSchedules,
    setCurrentSchedule,
}: {
    initialCachedSchedules: { [weekOffset: number]: SitSchedule };
    setCurrentSchedule: Dispatch<SetStateAction<SitSchedule>>;
}) {
    const [weekOffset, setWeekOffset] = useState(0);
    const [weekNumber, setWeekNumber] = useState(weekNumberFromSchedule(initialCachedSchedules[0]!));
    const [loadingNextWeek, setLoadingNextWeek] = useState(false);
    const [loadingPreviousWeek, setLoadingPreviousWeek] = useState(false);
    const [cachedSchedules, setCachedSchedules] = useState<{ [weekOffset: number]: SitSchedule }>(
        initialCachedSchedules
    );

    function weekNumberFromSchedule(schedule: SitSchedule): number {
        return DateTime.fromISO(schedule.days[0]!.date).weekNumber;
    }

    async function updateWeekOffset(modifier: number) {
        switch (modifier) {
            case -1:
                setLoadingPreviousWeek(true);
                break;
            case 1:
                setLoadingNextWeek(true);
                break;
        }
        const currentWeekOffset = modifier === 0 ? 0 : weekOffset + modifier;
        let cachedSchedule = cachedSchedules[currentWeekOffset];
        if (cachedSchedule === undefined) {
            cachedSchedule = await fetch("api/schedule", {
                method: "POST",
                body: JSON.stringify({ weekOffset: currentWeekOffset }),
            }).then((r) => r.json());
            if (cachedSchedule === undefined) {
                setLoadingPreviousWeek(false);
                setLoadingNextWeek(false);
                throw new Error("Failed to fetch schedule");
            }
            setCachedSchedules({ ...cachedSchedules, [currentWeekOffset]: cachedSchedule });
        }
        setWeekOffset(currentWeekOffset);
        setCurrentSchedule(cachedSchedule);
        setWeekNumber(weekNumberFromSchedule(cachedSchedule));
        setLoadingPreviousWeek(false);
        setLoadingNextWeek(false);
        // Pre-fetch next schedule (in same direction) if not in cache
        const nextWeekOffset = currentWeekOffset + modifier;
        if (nextWeekOffset in cachedSchedules) {
            return;
        }
        const nextSchedule = await fetch("api/schedule", {
            method: "POST",
            body: JSON.stringify({ weekOffset: nextWeekOffset }),
        }).then((r) => r.json());
        if (nextSchedule != undefined) {
            setCachedSchedules({ ...cachedSchedules, [nextWeekOffset]: nextSchedule });
        }
    }

    return (
        <Stack direction={"row"} justifyContent={"center"} alignItems={"center"} mb={1} sx={{ position: "relative" }}>
            <LoadingButton
                loading={loadingPreviousWeek}
                variant={"outlined"}
                sx={{ minWidth: { xs: "2rem", md: "4rem" } }}
                size={"small"}
                onClick={() => updateWeekOffset(-1)}
            >
                <ArrowBack />
            </LoadingButton>
            <Typography sx={{ opacity: 0.7 }} mx={2} variant={"subtitle2"}>{`UKE ${weekNumber}`}</Typography>
            <LoadingButton
                loading={loadingNextWeek}
                variant={"outlined"}
                sx={{ minWidth: { xs: "2rem", md: "4rem" } }}
                size={"small"}
                onClick={() => updateWeekOffset(1)}
            >
                <ArrowForward />
            </LoadingButton>
            <Button
                sx={{
                    ml: 1,
                    position: { xs: "absolute", md: "inherit" },
                    right: { xs: 10, md: "inherit" },
                }}
                variant={"outlined"}
                size={"small"}
                disabled={weekOffset === 0}
                onClick={() => updateWeekOffset(0)}
            >
                I dag
            </Button>
        </Stack>
    );
}
