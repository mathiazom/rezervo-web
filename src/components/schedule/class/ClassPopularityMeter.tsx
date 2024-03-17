import QuestionMarkRoundedIcon from "@mui/icons-material/QuestionMarkRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import {Tooltip} from "@mui/material";
import React from "react";

import RippleBadge from "@/components/utils/RippleBadge";
import {isClassInThePast} from "@/lib/helpers/date";
import {determineClassPopularity, stringifyClassPopularity} from "@/lib/helpers/popularity";
import {RezervoClass} from "@/types/chain";
import {ClassPopularity} from "@/types/popularity";
import {StatusColors} from "@/types/userSessions";

const ClassPopularityIcon = ({popularity}: { popularity: ClassPopularity }) => {
    if (popularity === ClassPopularity.Unknown) {
        return <QuestionMarkRoundedIcon fontSize={"small"}/>;
    }
    return <SpeedRoundedIcon style={{
        color: (
            popularity === ClassPopularity.High ? "red" : (
                popularity === ClassPopularity.Medium ? "orange" : "green"
            )
        ),
        filter: "drop-shadow(0 0 2px white)",
        '[data-mui-color-scheme="dark"] &': {
            filter: "drop-shadow(0 0 2px #191919)"
        },
    }}/>;
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

    const popularityIcon = <ClassPopularityIcon popularity={popularity}/>;

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
