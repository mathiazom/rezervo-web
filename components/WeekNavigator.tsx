import LoadingButton from "@mui/lab/LoadingButton";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Button, Stack, Typography, useTheme } from "@mui/material";
import React from "react";

export default function WeekNavigator({
    weekNumber,
    weekOffset,
    loadingPreviousWeek,
    loadingNextWeek,
    onUpdateWeekOffset,
}: {
    weekNumber: number;
    weekOffset: number;
    loadingPreviousWeek: boolean;
    loadingNextWeek: boolean;
    // eslint-disable-next-line no-unused-vars
    onUpdateWeekOffset: (modifier: number) => void;
}) {
    const theme = useTheme();

    return (
        <Stack direction={"row"} justifyContent={"center"} alignItems={"center"} mb={1} sx={{ position: "relative" }}>
            <LoadingButton
                loading={loadingPreviousWeek}
                variant={"outlined"}
                sx={{ minWidth: { xs: "2rem", md: "4rem" } }}
                size={"small"}
                onClick={() => onUpdateWeekOffset(-1)}
            >
                <ArrowBack />
            </LoadingButton>
            <Typography
                sx={{ opacity: 0.7 }}
                mx={2}
                variant={"subtitle2"}
                color={theme.palette.primary.contrastText}
            >{`UKE ${weekNumber}`}</Typography>
            <LoadingButton
                loading={loadingNextWeek}
                variant={"outlined"}
                sx={{ minWidth: { xs: "2rem", md: "4rem" } }}
                size={"small"}
                onClick={() => onUpdateWeekOffset(1)}
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
                onClick={() => onUpdateWeekOffset(0)}
            >
                I dag
            </Button>
        </Stack>
    );
}
