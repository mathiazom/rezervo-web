import { CancelRounded } from "@mui/icons-material";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import { Badge, Tooltip } from "@mui/material";

import RippleBadge from "@/components/utils/RippleBadge";
import { isClassInThePast } from "@/lib/helpers/date";
import { hasWaitingList, shouldShowClassAttendance, stringifyClassAttendance } from "@/lib/helpers/attendance";
import { RezervoClass } from "@/types/chain";
import { StatusColors } from "@/types/userSessions";

const attendanceColor = (_class: RezervoClass): string => {
    if (hasWaitingList(_class)) return "red";
    if (
        _class.availableSlots !== null &&
        _class.totalSlots !== null &&
        _class.availableSlots / _class.totalSlots <= 0.2
    )
        return "orange";
    return "green";
};

const ClassAttendanceIcon = ({ _class }: { _class: RezervoClass }) => {
    if (!shouldShowClassAttendance(_class)) return null;
    return <SpeedRoundedIcon style={{ color: attendanceColor(_class) }} />;
};

const ClassAttendanceMeter = ({ _class }: { _class: RezervoClass }) => {
    if (_class.isBookable) {
        return (
            <Tooltip title={stringifyClassAttendance(_class)}>
                <RippleBadge
                    invisible={isClassInThePast(_class)}
                    overlap="circular"
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                    variant={"dot"}
                    rippleColor={hasWaitingList(_class) ? StatusColors.WAITLIST : StatusColors.ACTIVE}
                >
                    <ClassAttendanceIcon _class={_class} />
                </RippleBadge>
            </Tooltip>
        );
    }

    if (_class.isCancelled) {
        return (
            <Tooltip title={"Timen er avlyst"}>
                <Badge overlap={"circular"} badgeContent={<CancelRounded fontSize={"small"} color={"error"} />}>
                    <ClassAttendanceIcon _class={_class} />
                </Badge>
            </Tooltip>
        );
    }

    return <ClassAttendanceIcon _class={_class} />;
};

export default ClassAttendanceMeter;
