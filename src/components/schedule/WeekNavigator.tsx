import { ArrowBack, ArrowForward } from "@mui/icons-material";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import { Avatar, AvatarGroup, Box, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";

import ScheduleFiltersDialog, {
    CATEGORIES_COLOR,
    EXCLUDE_CLASS_TIME_COLOR,
    LOCATIONS_COLOR,
} from "@/components/schedule/filter/ScheduleFiltersDialog";
import { offsetWeekParam } from "@/lib/helpers/schedule";
import { useActivityCategories } from "@/lib/hooks/useActivityCategories";
import { RezervoChain } from "@/types/openapi";
import { ExcludeClassTimeFiltersType } from "@/types/local";

export default function WeekNavigator({
    chain,
    weekParam,
    isLoadingPreviousWeek,
    isLoadingNextWeek,
    weekNumber,
    onChangeWeek,
    onToday,
    selectedLocationIds,
    setSelectedLocationIds,
    selectedCategories,
    setSelectedCategories,
    excludeClassTimeFilters,
    setExcludeClassTimeFilters,
}: {
    chain: RezervoChain;
    weekParam: string;
    isLoadingPreviousWeek: boolean;
    isLoadingNextWeek: boolean;
    weekNumber: number;
    onChangeWeek: (weekParam: string) => void;
    onToday: () => void;
    selectedLocationIds: string[];
    setSelectedLocationIds: (value: string[]) => void;
    selectedCategories: string[];
    setSelectedCategories: (value: string[]) => void;
    excludeClassTimeFilters: ExcludeClassTimeFiltersType;
    setExcludeClassTimeFilters: (value: ExcludeClassTimeFiltersType) => void;
}) {
    const allCategories = useActivityCategories();

    const totalLocations = chain.branches.reduce((acc, branch) => acc + branch.locations.length, 0);
    const isLocationFiltered = selectedLocationIds.length < totalLocations;

    const isCategoryFiltered = selectedCategories.length < allCategories.length;

    const isClassTimeFiltered =
        excludeClassTimeFilters.enabled && excludeClassTimeFilters.filters.some((filter) => filter.enabled);

    const isFiltered = isLocationFiltered || isCategoryFiltered || isClassTimeFiltered;

    const [isScheduleFiltersOpen, setIsScheduleFiltersOpen] = useState(false);

    function changeWeekByOffset(offset: number) {
        const week = offsetWeekParam(weekParam, offset);
        if (week != null) onChangeWeek(week);
    }

    return (
        <Stack
            direction={"row"}
            sx={{
                justifyContent: "center",
                alignItems: "center",
                mb: 1,
                position: "relative",
            }}
        >
            <Button
                startIcon={<FilterAltRoundedIcon />}
                sx={[
                    {
                        mr: 1,
                        position: { xs: "absolute", md: "inherit" },
                        left: { xs: 10, md: "inherit" },
                        height: "100%",
                    },
                    isFiltered
                        ? {}
                        : {
                              minWidth: 0,
                              ".MuiButton-startIcon": {
                                  margin: 0,
                              },
                          },
                ]}
                variant={"outlined"}
                size={"small"}
                onClick={() => setIsScheduleFiltersOpen(true)}
            >
                {isFiltered && (
                    <AvatarGroup
                        spacing={12}
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
                        {isClassTimeFiltered && (
                            <Avatar
                                sx={{
                                    width: 20,
                                    height: 20,
                                    fontSize: 12,
                                    backgroundColor: EXCLUDE_CLASS_TIME_COLOR[500],
                                }}
                            >
                                {excludeClassTimeFilters.filters.filter((filter) => filter.enabled).length}
                            </Avatar>
                        )}
                    </AvatarGroup>
                )}
            </Button>
            <ScheduleFiltersDialog
                chain={chain}
                open={isScheduleFiltersOpen}
                setOpen={setIsScheduleFiltersOpen}
                selectedLocationIds={selectedLocationIds}
                setSelectedLocationIds={setSelectedLocationIds}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                excludeClassTimeFilters={excludeClassTimeFilters}
                setExcludeClassTimeFilters={setExcludeClassTimeFilters}
            />
            <Button
                onClick={() => changeWeekByOffset(-1)}
                loading={isLoadingPreviousWeek}
                variant={"outlined"}
                sx={{ minWidth: { xs: "2rem", md: "4rem" } }}
                size={"small"}
            >
                <ArrowBack />
            </Button>
            <Typography
                variant={"subtitle2"}
                sx={{
                    mx: { xs: 1, md: 2 },
                    opacity: 0.7,
                }}
            >{`UKE ${weekNumber}`}</Typography>
            <Button
                onClick={() => changeWeekByOffset(1)}
                loading={isLoadingNextWeek}
                variant={"outlined"}
                sx={{ minWidth: { xs: "2rem", md: "4rem" } }}
                size={"small"}
            >
                <ArrowForward />
            </Button>
            <Box
                sx={{
                    ml: 1,
                    position: { xs: "absolute", md: "inherit" },
                    right: { xs: 10, md: "inherit" },
                }}
            >
                <Button onClick={onToday} variant={"outlined"} size={"small"}>
                    I dag
                </Button>
            </Box>
        </Stack>
    );
}
