import QuestionMarkRoundedIcon from "@mui/icons-material/QuestionMarkRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import { Theme, Tooltip, useTheme } from "@mui/material";
import React from "react";

import RippleBadge from "@/components/utils/RippleBadge";
import { isClassInThePast } from "@/lib/helpers/date";
import { determineClassPopularity, stringifyClassPopularity } from "@/lib/helpers/popularity";
import { RezervoClass } from "@/types/chain";
import { ClassPopularity } from "@/types/popularity";
import { StatusColors } from "@/types/userSessions";

export const getClassPopularityColors = (theme: Theme): Record<ClassPopularity, string> => ({
    [ClassPopularity.High]: theme.palette.error.main,
    [ClassPopularity.Medium]: theme.palette.warning.main,
    [ClassPopularity.Low]: theme.palette.primary.main,
    [ClassPopularity.Unknown]: theme.palette.grey.A700,
});

export const ClassPopularityIcon = ({ popularity, withColor }: { popularity: ClassPopularity; withColor: boolean }) => {
    const theme = useTheme();
    switch (popularity) {
        case ClassPopularity.High:
        case ClassPopularity.Medium:
        case ClassPopularity.Low:
            return <SpeedRoundedIcon sx={{ color: withColor ? getClassPopularityColors(theme)[popularity] : "" }} />;
        default:
            return <QuestionMarkRoundedIcon fontSize={"small"} />;
    }
};

const ClassPopularityMeter = ({
    _class,
    historicPopularity,
}: {
    _class: RezervoClass;
    historicPopularity: ClassPopularity;
}) => {
    const popularity =
        isClassInThePast(_class) || _class.isBookable ? determineClassPopularity(_class) : historicPopularity;

    const popularityIcon = <ClassPopularityIcon popularity={popularity} withColor={true} />;

    if (_class.isBookable) {
        return (
            <Tooltip
                title={"Påmelding for denne timen har åpnet. " + stringifyClassPopularity(_class, historicPopularity)}
            >
                <RippleBadge
                    invisible={isClassInThePast(_class)}
                    overlap="circular"
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                    variant={"dot"}
                    rippleColor={_class.availableSlots > 0 ? StatusColors.ACTIVE : StatusColors.WAITLIST}
                >
                    {popularityIcon}
                </RippleBadge>
            </Tooltip>
        );
    }

    return popularityIcon;
};

export default ClassPopularityMeter;
