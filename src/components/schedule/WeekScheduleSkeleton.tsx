import { alpha, Box, Chip, Divider, Stack, Typography, useTheme } from "@mui/material";
import { DateTime } from "luxon";

import ClassCardSkeleton from "@/components/schedule/class/ClassCardSkeleton";
import {
    firstDateOfWeekByOffset,
    fromCompactISOWeekString,
    getCapitalizedWeekday,
    isDayPassed,
    isToday,
    LocalizedDateTime,
} from "@/lib/helpers/date";
import { hexWithOpacityToRgb } from "@/lib/utils/colorUtils";

// Plausible per-day card counts so the skeleton grid does not look uniform while loading.
const SKELETON_CARD_COUNTS = [5, 6, 5, 6, 5, 3, 2];

function weekDates(weekParam: string): DateTime[] {
    const reference = fromCompactISOWeekString(weekParam);
    const monday = reference.isValid
        ? firstDateOfWeekByOffset(reference, 0)
        : firstDateOfWeekByOffset(LocalizedDateTime.now(), 0);
    return Array.from({ length: 7 }, (_, i) => monday.plus({ days: i }));
}

function DayScheduleSkeleton({ date, cardCount }: { date: DateTime; cardCount: number }) {
    const theme = useTheme();
    const dayIsToday = isToday(date);

    return (
        <Box sx={{ width: 196, flexGrow: 1 }}>
            <Box
                sx={[
                    { position: "sticky", top: 0, zIndex: 2 },
                    dayIsToday
                        ? {
                              backgroundColor: hexWithOpacityToRgb(theme.palette.primary.main, 0.1, 255),
                              "@media (prefers-color-scheme: dark)": {
                                  backgroundColor: hexWithOpacityToRgb(theme.palette.primary.main, 0.2, 0),
                              },
                          }
                        : { backgroundColor: (theme.vars ?? theme).palette.background.default },
                ]}
            >
                <Box sx={{ opacity: isDayPassed(date) ? 1 : 0.5, padding: "0.5rem 1rem" }}>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ fontSize: "1.125rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
                    >
                        {getCapitalizedWeekday(date)}{" "}
                        {dayIsToday && (
                            <Chip
                                size={"small"}
                                sx={{
                                    backgroundColor: theme.palette.primary.dark,
                                    color: "#fff",
                                    fontSize: "0.7rem",
                                    height: "18px",
                                }}
                                label="I dag"
                            />
                        )}
                    </Typography>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ color: theme.palette.grey[600], fontSize: "0.875rem" }}
                    >
                        {date.toFormat("yyyy-MM-dd")}
                    </Typography>
                </Box>
                <Divider orientation="horizontal" />
            </Box>
            <Box sx={{ padding: "0 0.5rem 2rem 0.5rem", marginTop: "0.5rem" }}>
                {Array.from({ length: cardCount }, (_, i) => (
                    <Box key={i} sx={{ mb: 1 }}>
                        <ClassCardSkeleton />
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

export default function WeekScheduleSkeleton({ weekParam }: { weekParam: string }) {
    const theme = useTheme();
    const days = weekDates(weekParam);

    return (
        <Box sx={{ display: "flex", flexGrow: 1, overflow: "auto", position: "relative", zIndex: 0 }}>
            <Stack direction={"column"} sx={{ flexGrow: "1" }}>
                <Stack direction={"row"} sx={{ margin: "auto", paddingX: "0.5rem", flexGrow: "1" }}>
                    {days.map((date, i) => {
                        const dayIsToday = isToday(date);
                        return (
                            <Box
                                key={date.toString()}
                                sx={[
                                    { display: "flex" },
                                    dayIsToday
                                        ? {
                                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                              "@media (prefers-color-scheme: dark)": {
                                                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                              },
                                          }
                                        : {},
                                ]}
                            >
                                <DayScheduleSkeleton date={date} cardCount={SKELETON_CARD_COUNTS[i] ?? 4} />
                            </Box>
                        );
                    })}
                </Stack>
            </Stack>
        </Box>
    );
}
