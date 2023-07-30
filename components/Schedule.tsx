import React, { Dispatch, SetStateAction } from "react";
import { Divider } from "@mui/material";
import { SitClass, SitSchedule } from "../types/sitTypes";
import { ClassPopularityIndex, AllConfigsIndex } from "../types/rezervoTypes";
import WeekNavigator from "./WeekNavigator";
import WeekSchedule from "./WeekSchedule";

const Schedule = ({
    initialCachedSchedules,
    currentSchedule,
    setCurrentSchedule,
    classPopularityIndex,
    selectable,
    selectedClassIds,
    allConfigsIndex,
    onSelectedChanged,
    onInfo,
}: {
    initialCachedSchedules: { [weekOffset: number]: SitSchedule };
    currentSchedule: SitSchedule;
    setCurrentSchedule: Dispatch<SetStateAction<SitSchedule>>;
    classPopularityIndex: ClassPopularityIndex;
    selectable: boolean;
    selectedClassIds: string[] | null;
    allConfigsIndex: AllConfigsIndex | null;
    // eslint-disable-next-line no-unused-vars
    onSelectedChanged: (classId: string, selected: boolean) => void;
    // eslint-disable-next-line no-unused-vars
    onInfo: (c: SitClass) => void;
}) => {
    return (
        <>
            <WeekNavigator initialCachedSchedules={initialCachedSchedules} setCurrentSchedule={setCurrentSchedule} />
            <Divider orientation="horizontal" />
            <WeekSchedule
                currentSchedule={currentSchedule}
                classPopularityIndex={classPopularityIndex}
                selectable={selectable}
                selectedClassIds={selectedClassIds}
                allConfigsIndex={allConfigsIndex}
                onSelectedChanged={onSelectedChanged}
                onInfo={onInfo}
            />
        </>
    );
};

export default Schedule;
