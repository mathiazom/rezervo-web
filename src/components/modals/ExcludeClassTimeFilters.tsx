import { Add, DeleteForeverRounded, DeleteRounded, RemoveRounded } from "@mui/icons-material";
import {
    Box,
    Button,
    Divider,
    FormControl,
    FormGroup,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import { DateTime, HourNumbers, MinuteNumbers, WeekdayNumbers } from "luxon";
import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

import { getCapitalizedWeekdays } from "@/lib/helpers/date";
import { storeExcludedClassTimeFilters } from "@/lib/helpers/storage";
import { ExcludeClassTimeFilter } from "@/types/chain";

export default function ExcludeClassTimeFilters({
    excludedClassTimeFilters,
    setExcludedClassTimeFilters,
}: {
    excludedClassTimeFilters: ExcludeClassTimeFilter[];
    setExcludedClassTimeFilters: Dispatch<SetStateAction<ExcludeClassTimeFilter[]>>;
}) {
    const theme = useTheme();

    const weekdays = getCapitalizedWeekdays();
    const [excludedClassTimeWeekday, setExcludedClassTimeWeekday] = useState<number>(1);
    const [excludedClassTimeStartTime, setExcludedClassTimeStartTime] = useState<DateTime | null>(null);
    const [excludedClassTimeEndTime, setExcludedClassTimeEndTime] = useState<DateTime | null>(null);
    const [inputValid, setInputValid] = useState<boolean>(false);

    const validateInput: () => false | ExcludeClassTimeFilter = useCallback(() => {
        if (
            excludedClassTimeWeekday >= 1 &&
            excludedClassTimeWeekday <= 7 &&
            excludedClassTimeStartTime !== null &&
            excludedClassTimeStartTime.isValid &&
            excludedClassTimeEndTime !== null &&
            excludedClassTimeEndTime.isValid &&
            excludedClassTimeStartTime < excludedClassTimeEndTime &&
            !excludedClassTimeFilters.some(
                (it) =>
                    it.weekday === excludedClassTimeWeekday &&
                    it.startHour === excludedClassTimeStartTime.hour &&
                    it.startMinute === excludedClassTimeStartTime.minute &&
                    it.endHour === excludedClassTimeEndTime.hour &&
                    it.endMinute === excludedClassTimeEndTime.minute,
            )
        ) {
            return {
                weekday: excludedClassTimeWeekday as WeekdayNumbers,
                startHour: excludedClassTimeStartTime.hour as HourNumbers,
                startMinute: excludedClassTimeStartTime.minute as MinuteNumbers,
                endHour: excludedClassTimeEndTime.hour as HourNumbers,
                endMinute: excludedClassTimeEndTime.minute as MinuteNumbers,
            }
        } else {
            return false
        }
    }, [excludedClassTimeFilters, excludedClassTimeWeekday, excludedClassTimeStartTime, excludedClassTimeEndTime]);

    useEffect(() => {
        setInputValid(validateInput() !== false);
    }, [
        validateInput,
        excludedClassTimeFilters,
        excludedClassTimeWeekday,
        excludedClassTimeStartTime,
        excludedClassTimeEndTime,
    ]);

    const addFilter = () => {
        const validInput = validateInput()
        if (validInput === false) {
            return;
        }

        setExcludedClassTimeFilters((filters) => {
            const newFilters = [
                ...filters,
                validInput,
            ];
            storeExcludedClassTimeFilters(newFilters);
            return newFilters;
        });
    };

    const removeFilter = (filter: ExcludeClassTimeFilter) => {
        setExcludedClassTimeFilters((filters) => {
            const newFilters = filters.filter((it) => it !== filter);
            storeExcludedClassTimeFilters(newFilters);
            return newFilters;
        });
    };

    const clearFilters = () => {
        setExcludedClassTimeFilters(() => {
            const empty: ExcludeClassTimeFilter[] = [];
            storeExcludedClassTimeFilters(empty);
            return empty;
        });
    };

    const toSortedFilters = (filters: ExcludeClassTimeFilter[]) => {
        return filters
            .toSorted((a, b) => a.endHour * 60 + a.endMinute - (b.endHour * 60 + b.endMinute))
            .toSorted((a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute))
            .toSorted((a, b) => a.weekday - b.weekday)
    }

    return (
        <Stack
            direction={"column"}
            sx={{
                px: { xs: 0.5, sm: 2 },
                mt: 1,
                mx: 3,
            }}
            gap={3}
        >
            <Stack gap={0.5}>
                <Typography variant="h6" textAlign={"center"} sx={{ fontSize: 18 }}>
                    Skjul tidsrom
                </Typography>
                <Typography
                    variant="body2"
                    textAlign={"center"}
                    sx={{
                        color: theme.palette.grey[600],
                        fontSize: 14,
                        mb: 1,
                    }}
                >
                    Legg til tidsrom du vil skjule fra timeplanen.
                </Typography>
            </Stack>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    addFilter();
                }}
            >
                <FormControl component="fieldset">
                    <FormGroup sx={{ mt: 1 }}>
                        <Stack direction={"column"} gap={2}>
                            <InputLabel id="exclude-class-time-filter-weekday">Ukedag</InputLabel>
                            <Select
                                labelId="exclude-class-time-filter-weekday"
                                id="exclude-class-time-select"
                                value={excludedClassTimeWeekday}
                                label="Ukedag"
                                onChange={({ target: { value } }) => {
                                    if (typeof value === "string") return;
                                    setExcludedClassTimeWeekday(() => value);
                                }}
                            >
                                {weekdays.map((day, i) => (
                                    <MenuItem key={i} value={i + 1}>
                                        {day}
                                    </MenuItem>
                                ))}
                            </Select>
                            <Stack direction={"row"} gap={2} alignItems={"center"}>
                                <TimePicker
                                    label="Fra"
                                    views={["hours", "minutes"]}
                                    value={excludedClassTimeStartTime}
                                    onChange={(newValue) => setExcludedClassTimeStartTime(newValue)}
                                />
                                <RemoveRounded />
                                <TimePicker
                                    label="Til"
                                    views={["hours", "minutes"]}
                                    value={excludedClassTimeEndTime}
                                    onChange={(newValue) => setExcludedClassTimeEndTime(newValue)}
                                />
                            </Stack>
                            <Stack direction={"row"} gap={1} justifyContent={"center"}>
                                <Button
                                    startIcon={<Add />}
                                    variant={"outlined"}
                                    type={"submit"}
                                    disabled={!inputValid}
                                    size="large"
                                    fullWidth
                                >
                                    Skjul tidsrom
                                </Button>
                            </Stack>
                        </Stack>
                    </FormGroup>
                </FormControl>
            </form>
            <Divider />
            <Stack>
                <Typography variant="h6" textAlign={"center"} sx={{ fontSize: 18 }}>
                    Skjulte tidsrom
                </Typography>
                <Box sx={{ mt: 1 }}>
                    {toSortedFilters(excludedClassTimeFilters)
                        .map((filter) => (
                            <Stack
                                key={JSON.stringify(filter)}
                                direction={"row"}
                                alignItems={"center"}
                                justifyContent={"space-between"}
                            >
                                <Typography>{weekdays[filter.weekday - 1]}</Typography>
                                <Typography>
                                    {filter.startHour.toFixed(0).padStart(2, "0")}:
                                    {filter.startMinute.toFixed(0).padStart(2, "0")}
                                    {" – "}
                                    {filter.endHour.toFixed(0).padStart(2, "0")}:
                                    {filter.endMinute.toFixed(0).padStart(2, "0")}
                                </Typography>
                                <Tooltip title="Fjern tidsrom">
                                    <IconButton
                                        onClick={(event) => {
                                            event.preventDefault();
                                            removeFilter(filter);
                                        }}
                                        sx={{ opacity: 0.5 }}
                                    >
                                        <DeleteRounded />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        ))}
                </Box>
                {excludedClassTimeFilters.length === 0 ? (
                    <Typography variant={"body2"} textAlign={"center"} sx={{ opacity: 0.6, fontStyle: "italic" }}>
                        Du har ikke eksludert noen tidsrom.
                    </Typography>
                ) : (
                    <Button
                        startIcon={<DeleteForeverRounded />}
                        variant={"outlined"}
                        color={"error"}
                        onClick={clearFilters}
                        sx={{ mt: 2 }}
                    >
                        Fjern alle
                    </Button>
                )}
            </Stack>
        </Stack>
    );
}
