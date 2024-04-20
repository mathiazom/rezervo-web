import { ArrowBack, ArrowForward } from "@mui/icons-material";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import LoadingButton from "@mui/lab/LoadingButton";
import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import { useQueryState } from "nuqs";
import React, { Dispatch, SetStateAction, useMemo, useState } from "react";

import ScheduleFiltersDialog, { CATEGORIES_COLOR, LOCATIONS_COLOR } from "@/components/modals/ScheduleFiltersDialog";
import { ISO_WEEK_QUERY_PARAM } from "@/lib/consts";
import { compactISOWeekString, fromCompactISOWeekString, LocalizedDateTime } from "@/lib/helpers/date";
import { ActivityCategory, RezervoChain } from "@/types/chain";

export default function WeekNavigator({
    chain,
    isLoadingPreviousWeek,
    isLoadingNextWeek,
    weekNumber,
    onGoToToday,
    selectedLocationIds,
    setSelectedLocationIds,
    allCategories,
    selectedCategories,
    setSelectedCategories,
}: {
    chain: RezervoChain;
    isLoadingPreviousWeek: boolean;
    isLoadingNextWeek: boolean;
    weekNumber: number;
    onGoToToday: () => void;
    selectedLocationIds: string[];
    setSelectedLocationIds: Dispatch<SetStateAction<string[]>>;
    allCategories: ActivityCategory[];
    selectedCategories: string[];
    setSelectedCategories: Dispatch<SetStateAction<string[]>>;
}) {
    const [weekParam, setWeekParam] = useQueryState(ISO_WEEK_QUERY_PARAM);

    const isLocationFiltered = useMemo(() => {
        const totalLocations = chain.branches.reduce((acc, branch) => acc + branch.locations.length, 0);
        return selectedLocationIds.length < totalLocations;
    }, [selectedLocationIds, chain]);

    const isCategoryFiltered = useMemo(() => {
        return selectedCategories.length < allCategories.length;
    }, [selectedCategories, allCategories]);

    const isFiltered = isLocationFiltered || isCategoryFiltered;

    const [isScheduleFiltersOpen, setIsScheduleFiltersOpen] = useState(false);

    function offsetWeekNumber(offset: number) {
        const firstDayOfWeek = weekParam
            ? fromCompactISOWeekString(weekParam)
            : LocalizedDateTime.now().startOf("week");
        if (firstDayOfWeek === null) return;
        setWeekParam(compactISOWeekString(firstDayOfWeek.plus({ weeks: offset })));
    }

    function goToCurrentWeek() {
        setWeekParam(compactISOWeekString(LocalizedDateTime.now()));
    }

    return (
        <Stack direction={"row"} justifyContent={"center"} alignItems={"center"} mb={1} sx={{ position: "relative" }}>
            <Button
                startIcon={<FilterAltRoundedIcon />}
                sx={{
                    mr: 1,
                    position: { xs: "absolute", md: "inherit" },
                    left: { xs: 10, md: "inherit" },
                    height: "100%",
                    ...(isFiltered
                        ? {}
                        : {
                              minWidth: 0,
                              ".MuiButton-startIcon": {
                                  margin: 0,
                              },
                          }),
                }}
                variant={"outlined"}
                size={"small"}
                onClick={() => setIsScheduleFiltersOpen(true)}
            >
                {isFiltered && (
                    <Box
                        sx={{
                            display: "flex",
                            gap: 0.5,
                            alignItems: "center",
                        }}
                    >
                        {isLocationFiltered && (
                            <Avatar
                                sx={{
                                    width: 20,
                                    height: 20,
                                    fontSize: 12,
                                    backgroundColor: LOCATIONS_COLOR[500],
                                }}
                            >
                                {selectedLocationIds.length}
                            </Avatar>
                        )}
                        {isCategoryFiltered && (
                            <Avatar
                                sx={{
                                    width: 20,
                                    height: 20,
                                    fontSize: 12,
                                    backgroundColor: CATEGORIES_COLOR[500],
                                }}
                            >
                                {selectedCategories.length}
                            </Avatar>
                        )}
                    </Box>
                )}
            </Button>
            <ScheduleFiltersDialog
                chain={chain}
                open={isScheduleFiltersOpen}
                setOpen={setIsScheduleFiltersOpen}
                selectedLocationIds={selectedLocationIds}
                setSelectedLocationIds={setSelectedLocationIds}
                allCategories={allCategories}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
            />
            <LoadingButton
                loading={isLoadingPreviousWeek}
                variant={"outlined"}
                sx={{ minWidth: { xs: "2rem", md: "4rem" } }}
                size={"small"}
                onClick={() => offsetWeekNumber(-1)}
            >
                <ArrowBack />
            </LoadingButton>
            <Typography sx={{ opacity: 0.7 }} mx={2} variant={"subtitle2"}>{`UKE ${weekNumber}`}</Typography>
            <LoadingButton
                loading={isLoadingNextWeek}
                variant={"outlined"}
                sx={{ minWidth: { xs: "2rem", md: "4rem" } }}
                size={"small"}
                onClick={() => offsetWeekNumber(1)}
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
                onClick={() => {
                    goToCurrentWeek();
                    onGoToToday();
                    // handle case where we are not viewing current week by
                    // re-scrolling when current week has (hopefully) loaded
                    // TODO: improve this (possibly with URL params)
                    setTimeout(() => {
                        onGoToToday();
                    }, 300);
                }}
            >
                I dag
            </Button>
        </Stack>
    );
}
