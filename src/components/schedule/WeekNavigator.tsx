import { ArrowBack, ArrowForward } from "@mui/icons-material";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import { Avatar, AvatarGroup, Button, Stack, Typography } from "@mui/material";
import { parseAsBoolean, useQueryState } from "nuqs";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

import ScheduleFiltersDialog, {
    CATEGORIES_COLOR,
    EXCLUDE_CLASS_TIME_COLOR,
    LOCATIONS_COLOR,
} from "@/components/modals/ScheduleFiltersDialog";
import { ISO_WEEK_QUERY_PARAM, SCROLL_TO_NOW_QUERY_PARAM } from "@/lib/consts";
import { compactISOWeekString, fromCompactISOWeekString, LocalizedDateTime } from "@/lib/helpers/date";
import { ActivityCategory, ExcludeClassTimeFiltersType, RezervoChain } from "@/types/chain";

export default function WeekNavigator({
    chain,
    isLoadingPreviousWeek,
    isLoadingNextWeek,
    weekNumber,
    selectedLocationIds,
    setSelectedLocationIds,
    allCategories,
    selectedCategories,
    setSelectedCategories,
    excludeClassTimeFilters,
    setExcludeClassTimeFilters,
}: {
    chain: RezervoChain;
    isLoadingPreviousWeek: boolean;
    isLoadingNextWeek: boolean;
    weekNumber: number;
    selectedLocationIds: string[];
    setSelectedLocationIds: Dispatch<SetStateAction<string[]>>;
    allCategories: ActivityCategory[];
    selectedCategories: string[];
    setSelectedCategories: Dispatch<SetStateAction<string[]>>;
    excludeClassTimeFilters: ExcludeClassTimeFiltersType;
    setExcludeClassTimeFilters: Dispatch<SetStateAction<ExcludeClassTimeFiltersType>>;
}) {
    const [weekParam, setWeekParam] = useQueryState(ISO_WEEK_QUERY_PARAM);
    const [scrollToNowParam, setScrollToNowParam] = useQueryState(SCROLL_TO_NOW_QUERY_PARAM, parseAsBoolean);

    const isLocationFiltered = useMemo(() => {
        const totalLocations = chain.branches.reduce((acc, branch) => acc + branch.locations.length, 0);
        return selectedLocationIds.length < totalLocations;
    }, [selectedLocationIds, chain]);

    const isCategoryFiltered = useMemo(() => {
        return selectedCategories.length < allCategories.length;
    }, [selectedCategories, allCategories]);

    const isClassTimeFiltered = useMemo(() => {
        return excludeClassTimeFilters.enabled && excludeClassTimeFilters.filters.some((filter) => filter.enabled);
    }, [excludeClassTimeFilters]);

    const isFiltered = isLocationFiltered || isCategoryFiltered || isClassTimeFiltered;

    const [isScheduleFiltersOpen, setIsScheduleFiltersOpen] = useState(false);

    function offsetWeekNumber(offset: number) {
        const firstDayOfWeek = weekParam
            ? fromCompactISOWeekString(weekParam)
            : LocalizedDateTime.now().startOf("week");
        if (firstDayOfWeek === null) return;
        setScrollToNowParam(null);
        setWeekParam(compactISOWeekString(firstDayOfWeek.plus({ weeks: offset })));
    }

    async function goToNow() {
        setWeekParam(compactISOWeekString(LocalizedDateTime.now()));
        if (scrollToNowParam) {
            await setScrollToNowParam(null);
        }
        setScrollToNowParam(true);
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
                allCategories={allCategories}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                excludeClassTimeFilters={excludeClassTimeFilters}
                setExcludeClassTimeFilters={setExcludeClassTimeFilters}
            />
            <Button
                loading={isLoadingPreviousWeek}
                variant={"outlined"}
                sx={{ minWidth: { xs: "2rem", md: "4rem" } }}
                size={"small"}
                onClick={() => offsetWeekNumber(-1)}
            >
                <ArrowBack />
            </Button>
            <Typography
                variant={"subtitle2"}
                sx={{
                    mx: 2,
                    opacity: 0.7,
                }}
            >{`UKE ${weekNumber}`}</Typography>
            <Button
                loading={isLoadingNextWeek}
                variant={"outlined"}
                sx={{ minWidth: { xs: "2rem", md: "4rem" } }}
                size={"small"}
                onClick={() => offsetWeekNumber(1)}
            >
                <ArrowForward />
            </Button>
            <Button
                sx={{
                    ml: 1,
                    position: { xs: "absolute", md: "inherit" },
                    right: { xs: 10, md: "inherit" },
                }}
                variant={"outlined"}
                size={"small"}
                onClick={() => goToNow()}
            >
                I dag
            </Button>
        </Stack>
    );
}
