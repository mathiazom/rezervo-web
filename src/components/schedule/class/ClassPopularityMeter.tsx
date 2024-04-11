import QuestionMarkRoundedIcon from "@mui/icons-material/QuestionMarkRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import { Tooltip } from "@mui/material";
import React from "react";

import RippleBadge from "@/components/utils/RippleBadge";
import { isClassInThePast } from "@/lib/helpers/date";
import { determineClassPopularity, hasWaitingList, stringifyClassPopularity } from "@/lib/helpers/popularity";
import { RezervoClass } from "@/types/chain";
import { ClassPopularity } from "@/types/popularity";
import { StatusColors } from "@/types/userSessions";

const ClassPopularityIcon = ({ popularity }: { popularity: ClassPopularity }) => {
    switch (popularity) {
        case ClassPopularity.High:
            return <SpeedRoundedIcon style={{ color: "red" }} />;
        case ClassPopularity.Medium:
            return <SpeedRoundedIcon style={{ color: "orange" }} />;
        case ClassPopularity.Low:
            return <SpeedRoundedIcon style={{ color: "green" }} />;
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

    const popularityIcon = <ClassPopularityIcon popularity={popularity} />;

    if (_class.isBookable) {
        return (
            <Tooltip
                title={
                    "Påmelding for denne timen har åpnet. " +
                    (stringifyClassPopularity(_class, historicPopularity) ?? "")
                }
            >
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
                    {popularityIcon}
                </RippleBadge>
            </Tooltip>
        );
    }

    return popularityIcon;
};

export default ClassPopularityMeter;
