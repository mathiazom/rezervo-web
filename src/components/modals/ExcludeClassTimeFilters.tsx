import { Add, DeleteForeverRounded, DeleteRounded, RemoveRounded } from "@mui/icons-material";
import {
    Box,
    Button,
    Collapse,
    Divider,
    FormControl,
    FormGroup,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { TimePicker } from "@mui/x-date-pickers";
import { DateTime, HourNumbers, MinuteNumbers, WeekdayNumbers } from "luxon";
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";

import { getCapitalizedWeekdays } from "@/lib/helpers/date";
import { storeExcludeClassTimeFilters } from "@/lib/helpers/storage";
import { ExcludeClassTimeFilter, ExcludeClassTimeFiltersType } from "@/types/chain";

export default function ExcludeClassTimeFilters({
    excludeClassTimeFilters,
    setExcludeClassTimeFilters,
}: {
    excludeClassTimeFilters: ExcludeClassTimeFiltersType;
    setExcludeClassTimeFilters: Dispatch<SetStateAction<ExcludeClassTimeFiltersType>>;
}) {
    const theme = useTheme();

    const weekdays = getCapitalizedWeekdays();
    const [excludeClassTimeWeekday, setExcludeClassTimeWeekday] = useState<number>(1);
    const [excludeClassTimeStartTime, setExcludeClassTimeStartTime] = useState<DateTime | null>(null);
    const [excludeClassTimeEndTime, setExcludeClassTimeEndTime] = useState<DateTime | null>(null);

    const validateInput: () => false | ExcludeClassTimeFilter = useCallback(() => {
        if (
            excludeClassTimeWeekday >= 1 &&
            excludeClassTimeWeekday <= 7 &&
            excludeClassTimeStartTime !== null &&
            excludeClassTimeStartTime.isValid &&
            excludeClassTimeEndTime !== null &&
            excludeClassTimeEndTime.isValid &&
            excludeClassTimeStartTime < excludeClassTimeEndTime &&
            !excludeClassTimeFilters.filters.some(
                (it) =>
                    it.weekday === excludeClassTimeWeekday &&
                    it.startHour === excludeClassTimeStartTime.hour &&
                    it.startMinute === excludeClassTimeStartTime.minute &&
                    it.endHour === excludeClassTimeEndTime.hour &&
                    it.endMinute === excludeClassTimeEndTime.minute,
            )
        ) {
            return {
                weekday: excludeClassTimeWeekday as WeekdayNumbers,
                startHour: excludeClassTimeStartTime.hour as HourNumbers,
                startMinute: excludeClassTimeStartTime.minute as MinuteNumbers,
                endHour: excludeClassTimeEndTime.hour as HourNumbers,
                endMinute: excludeClassTimeEndTime.minute as MinuteNumbers,
                enabled: true,
            };
        } else {
            return false;
        }
    }, [excludeClassTimeFilters, excludeClassTimeWeekday, excludeClassTimeStartTime, excludeClassTimeEndTime]);

    const inputValid = useMemo(() => validateInput() !== false, [validateInput]);

    const addFilter = () => {
        const validInput = validateInput();
        if (validInput === false) {
            return;
        }

        setExcludeClassTimeFilters((prevState) => {
            const newFilters = { ...prevState, filters: [...prevState.filters, validInput] };
            storeExcludeClassTimeFilters(newFilters);
            return newFilters;
        });
    };

    const toggleFilter = (excludeClassTimeFilter: ExcludeClassTimeFilter) => {
        setExcludeClassTimeFilters((prevState) => {
            for (const filter of prevState.filters) {
                if (equalFilters(filter, excludeClassTimeFilter)) {
                    filter.enabled = !filter.enabled;
                }
            }
            storeExcludeClassTimeFilters(prevState);
            return { ...prevState };
        });
    };

    const toggleAllFilters = () => {
        setExcludeClassTimeFilters((prevState) => {
            const newState = { ...prevState, enabled: !prevState.enabled };
            storeExcludeClassTimeFilters(newState);
            return newState;
        });
    };

    const equalFilters = (a: ExcludeClassTimeFilter, b: ExcludeClassTimeFilter) => {
        return (
            a.weekday === b.weekday &&
            a.startHour === b.startHour &&
            a.startMinute === b.startMinute &&
            a.endHour === b.endHour &&
            a.endMinute === b.endMinute &&
            a.enabled === b.enabled
        );
    };

    const removeFilter = (filter: ExcludeClassTimeFilter) => {
        setExcludeClassTimeFilters((prevState) => {
            const newState = {
                ...prevState,
                filters: prevState.filters.filter((it) => !equalFilters(filter, it)),
            };
            storeExcludeClassTimeFilters(newState);
            return newState;
        });
    };

    const clearFilters = () => {
        setExcludeClassTimeFilters((prevState) => {
            const newState = { ...prevState, filters: [] };
            storeExcludeClassTimeFilters(newState);
            return newState;
        });
    };

    const toSortedFilters = (filters: ExcludeClassTimeFilter[]) => {
        return filters
            .toSorted((a, b) => a.endHour * 60 + a.endMinute - (b.endHour * 60 + b.endMinute))
            .toSorted((a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute))
            .toSorted((a, b) => a.weekday - b.weekday);
    };

    return (
        <Stack
            direction={"column"}
            sx={{
                gap: 3,
                px: { xs: 0.5, sm: 2 },
                mt: 1,
                mx: 3,
            }}
        >
            <Stack
                sx={{
                    gap: 0.5,
                }}
            >
                <Box sx={{ position: "relative", alignItems: "center" }}>
                    <Typography
                        variant="h6"
                        sx={{
                            textAlign: "left",
                            fontSize: 18,
                        }}
                    >
                        Skjul tidsrom
                    </Typography>
                    <Switch
                        checked={excludeClassTimeFilters.enabled}
                        onChange={toggleAllFilters}
                        sx={{ position: "absolute", right: 0, top: 0, marginTop: -0.5 }}
                    />
                </Box>
                <Typography
                    variant="body2"
                    sx={{
                        textAlign: "left",
                        color: theme.palette.grey[600],
                        fontSize: 14,
                        mb: 1,
                    }}
                >
                    Legg til tidsrom du vil skjule fra timeplanen.
                </Typography>
            </Stack>
            <Collapse in={excludeClassTimeFilters.enabled} sx={{ paddingTop: 1 }}>
                <>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            addFilter();
                        }}
                    >
                        <FormControl component="fieldset">
                            <FormGroup sx={{ mt: 1 }}>
                                <Stack
                                    direction={"column"}
                                    sx={{
                                        gap: 2,
                                    }}
                                >
                                    <InputLabel id="exclude-class-time-filter-weekday">Ukedag</InputLabel>
                                    <Select
                                        labelId="exclude-class-time-filter-weekday"
                                        id="exclude-class-time-select"
                                        value={excludeClassTimeWeekday}
                                        label="Ukedag"
                                        onChange={({ target: { value } }) => {
                                            if (typeof value === "string") return;
                                            setExcludeClassTimeWeekday(() => value);
                                        }}
                                    >
                                        {weekdays.map((day, i) => (
                                            <MenuItem key={i} value={i + 1}>
                                                {day}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <Stack
                                        direction={"row"}
                                        sx={{
                                            gap: 2,
                                            alignItems: "center",
                                        }}
                                    >
                                        <TimePicker
                                            label="Fra"
                                            views={["hours", "minutes"]}
                                            value={excludeClassTimeStartTime}
                                            onChange={(newValue) => setExcludeClassTimeStartTime(newValue)}
                                        />
                                        <RemoveRounded />
                                        <TimePicker
                                            label="Til"
                                            views={["hours", "minutes"]}
                                            value={excludeClassTimeEndTime}
                                            onChange={(newValue) => setExcludeClassTimeEndTime(newValue)}
                                        />
                                    </Stack>
                                    <Stack
                                        direction={"row"}
                                        sx={{
                                            gap: 1,
                                            justifyContent: "center",
                                        }}
                                    >
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
                    <Stack
                        sx={{
                            justifyContent: "center",
                            height: 50,
                        }}
                    >
                        <Divider />
                    </Stack>
                    <Stack>
                        <Typography
                            variant="h6"
                            sx={{
                                textAlign: "left",
                                fontSize: 18,
                            }}
                        >
                            Skjulte tidsrom
                        </Typography>
                        <Grid2 container rowSpacing={1}>
                            {toSortedFilters(excludeClassTimeFilters.filters).map((filter) => (
                                <>
                                    <Grid2
                                        size={{
                                            xs: 2,
                                            sm: 4,
                                        }}
                                        sx={{
                                            textAlign: "left",
                                            alignContent: "center",
                                        }}
                                    >
                                        <Typography variant="body2">{weekdays[filter.weekday - 1]}</Typography>
                                    </Grid2>
                                    <Grid2
                                        size={{
                                            xs: 6,
                                            sm: 4,
                                        }}
                                        sx={{
                                            textAlign: "center",
                                            alignContent: "center",
                                        }}
                                    >
                                        <Typography variant="body2">
                                            {filter.startHour.toFixed(0).padStart(2, "0")}:
                                            {filter.startMinute.toFixed(0).padStart(2, "0")}
                                            {" – "}
                                            {filter.endHour.toFixed(0).padStart(2, "0")}:
                                            {filter.endMinute.toFixed(0).padStart(2, "0")}
                                        </Typography>
                                    </Grid2>
                                    <Grid2
                                        size={4}
                                        sx={{
                                            textAlign: "right",
                                            alignContent: "center",
                                        }}
                                    >
                                        <Switch checked={filter.enabled} onChange={() => toggleFilter(filter)} />
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
                                    </Grid2>
                                </>
                            ))}
                        </Grid2>
                        {excludeClassTimeFilters.filters.length === 0 ? (
                            <Typography
                                variant={"body2"}
                                sx={{
                                    textAlign: "center",
                                    opacity: 0.6,
                                    fontStyle: "italic",
                                }}
                            >
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
                </>
            </Collapse>
        </Stack>
    );
}
