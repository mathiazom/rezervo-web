import { ArrowBack, ArrowForward } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Button, Stack, Typography } from "@mui/material";
import { deserializeWeekSchedule } from "lib/serializers";
import React, { Dispatch, SetStateAction, useState } from "react";
import { RezervoSchedule, RezervoWeekSchedule } from "types/rezervo";

function getWeekNumber(weekSchedule: RezervoWeekSchedule): number {
    const firstDay = weekSchedule[0];
    if (firstDay === undefined) {
        throw new Error("Week schedule is empty (missing first day)");
    }
    return firstDay.date.weekNumber;
}

export default function WeekNavigator({
    initialSchedule,
    setCurrentWeekSchedule,
}: {
    initialSchedule: RezervoSchedule;
    setCurrentWeekSchedule: Dispatch<SetStateAction<RezervoWeekSchedule>>;
}) {
    const [weekOffset, setWeekOffset] = useState(0);
    const [weekNumber, setWeekNumber] = useState(getWeekNumber(initialSchedule[0]!));
    const [loadingNextWeek, setLoadingNextWeek] = useState(false);
    const [loadingPreviousWeek, setLoadingPreviousWeek] = useState(false);
    const [schedule, setSchedule] = useState<RezervoSchedule>(initialSchedule);

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
        let currentWeekSchedule = schedule[currentWeekOffset];
        if (currentWeekSchedule === undefined) {
            currentWeekSchedule = deserializeWeekSchedule(
                await fetch("api/schedule", {
                    method: "POST",
                    body: JSON.stringify({ weekOffset: currentWeekOffset }),
                }).then((r) => r.json()),
            );
            if (currentWeekSchedule === undefined) {
                setLoadingPreviousWeek(false);
                setLoadingNextWeek(false);
                throw new Error("Failed to fetch schedule");
            }
            setSchedule({ ...schedule, [currentWeekOffset]: currentWeekSchedule });
        }
        setWeekOffset(currentWeekOffset);
        setCurrentWeekSchedule(currentWeekSchedule);
        setWeekNumber(getWeekNumber(currentWeekSchedule));
        setLoadingPreviousWeek(false);
        setLoadingNextWeek(false);
        // Pre-fetch next schedule (in same direction) if not in cache
        const nextWeekOffset = currentWeekOffset + modifier;
        if (nextWeekOffset in schedule) {
            return;
        }
        const nextWeekSchedule = deserializeWeekSchedule(
            await fetch("api/schedule", {
                method: "POST",
                body: JSON.stringify({ weekOffset: nextWeekOffset }),
            }).then((r) => r.json()),
        );
        if (nextWeekSchedule != undefined) {
            setSchedule({ ...schedule, [nextWeekOffset]: nextWeekSchedule });
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
