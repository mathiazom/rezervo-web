import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import QuestionMarkRoundedIcon from "@mui/icons-material/QuestionMarkRounded";
import { ClassPopularity, StatusColors } from "../../types/rezervoTypes";
import { SitClass } from "../../types/sitTypes";
import { isClassInThePast } from "../../lib/iBooking";
import { stringifyClassPopularity, determineClassPopularity } from "../../lib/popularity";
import RippleBadge from "../RippleBadge";
import { Tooltip } from "@mui/material";

const ClassPopularityIcon = ({ popularity }: { popularity: ClassPopularity }) => {
    switch (popularity) {
        case ClassPopularity.High:
            return <SpeedRoundedIcon style={{ color: "red" }} />;
        case ClassPopularity.Medium:
            return <SpeedRoundedIcon style={{ color: "orange" }} />;
        case ClassPopularity.Low:
            return <SpeedRoundedIcon style={{ color: "green" }} />;
        default:
            return <QuestionMarkRoundedIcon />;
    }
};

const ClassPopularityMeter = ({
    _class,
    historicPopularity,
}: {
    _class: SitClass;
    historicPopularity: ClassPopularity;
}) => {
    const popularity =
        isClassInThePast(_class) || _class.bookable ? determineClassPopularity(_class) : historicPopularity;

    if (_class.bookable) {
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
                    rippleColor={StatusColors.ACTIVE}
                >
                    <ClassPopularityIcon popularity={popularity} />
                </RippleBadge>
            </Tooltip>
        );
    }

    return <ClassPopularityIcon popularity={popularity} />;
};

export default ClassPopularityMeter;
