import { Box, Chip, Typography, useTheme } from "@mui/material";
import React from "react";

import ClassCard from "@/components/schedule/class/ClassCard";
import { getCapitalizedWeekday, isDayPassed, isToday } from "@/lib/helpers/date";
import { classRecurrentId } from "@/lib/helpers/recurrentId";
import { ChainIdentifier, RezervoClass, RezervoDaySchedule } from "@/types/chain";
import { ClassPopularity, ClassPopularityIndex } from "@/types/popularity";

function DaySchedule({
    chain,
    daySchedule,
    selectedLocationIds,
    selectedCategories,
    classPopularityIndex,
    selectable,
    selectedClassIds,
    onUpdateConfig,
    onInfo,
}: {
    chain: ChainIdentifier;
    daySchedule: RezervoDaySchedule;
    selectedLocationIds: string[];
    selectedCategories: string[];
    classPopularityIndex: ClassPopularityIndex;
    selectable: boolean;
    selectedClassIds: string[] | null;
    onUpdateConfig: (classId: string, selected: boolean) => void;
    onInfo: (c: RezervoClass) => void;
}) {
    const theme = useTheme();

    const filteredClasses = daySchedule.classes.filter(
        (c) => selectedLocationIds.includes(c.location.id) && selectedCategories.includes(c.activity.category),
    );

    return (
        <Box key={daySchedule.date.toString()} width={180}>
            <Box pt={1.5} pb={2} sx={{ opacity: isDayPassed(daySchedule.date) ? 1 : 0.5 }}>
                <Typography variant="h6" component="div">
                    {getCapitalizedWeekday(daySchedule.date)}{" "}
                    {isToday(daySchedule.date) && (
                        <Chip
                            size={"small"}
                            sx={{ backgroundColor: theme.palette.primary.dark, color: "#fff" }}
                            label="I dag"
                        />
                    )}
                </Typography>
                <Typography
                    variant="h6"
                    component="div"
                    style={{
                        color: theme.palette.grey[600],
                        fontSize: 15,
                    }}
                >
                    {daySchedule.date.toFormat("yyyy-MM-dd")}
                </Typography>
            </Box>
            {filteredClasses.length > 0 ? (
                filteredClasses.map((_class) => (
                    <Box key={_class.id} mb={1}>
                        <ClassCard
                            chain={chain}
                            _class={_class}
                            popularity={classPopularityIndex[classRecurrentId(_class)] ?? ClassPopularity.Unknown}
                            selectable={selectable}
                            selected={selectedClassIds != null && selectedClassIds.includes(classRecurrentId(_class))}
                            onUpdateConfig={(s) => onUpdateConfig(classRecurrentId(_class), s)}
                            onInfo={() => onInfo(_class)}
                        />
                    </Box>
                ))
            ) : (
                <>
                    <p>Ingen gruppetimer</p>
                </>
            )}
        </Box>
    );
}

export default DaySchedule;
