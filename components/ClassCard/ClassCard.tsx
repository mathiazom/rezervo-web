import { Box, Card, CardActions, CardContent, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { SitClass } from "../../types/sitTypes";
import { simpleTimeStringFromISO } from "../../utils/timeUtils";
import { hexWithOpacityToRgb } from "../../utils/colorUtils";
import { EnterLeaveAnimation, OVER_THE_TOP_ANIMATIONS } from "../../types/animationTypes";
import { randomElementFromArray } from "../../utils/arrayUtils";
import IconButton from "@mui/material/IconButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ClassPopularity } from "../../types/derivedTypes";
import ClassPopularityMeter from "./ClassPopularityMeter";

const ClassCard = ({
    _class,
    popularity,
    selectable,
    selected,
    onSelectedChanged,
    onInfo,
}: // onSettings,
{
    _class: SitClass;
    popularity: ClassPopularity;
    selectable: boolean;
    selected: boolean;
    // eslint-disable-next-line no-unused-vars
    onSelectedChanged: (selected: boolean) => void;
    onInfo: () => void;
    // onSettings: () => void;
}) => {
    const theme = useTheme();

    const [selectAnimation, setSelectAnimation] = useState<EnterLeaveAnimation | null>(
        selected ? randomElementFromArray(OVER_THE_TOP_ANIMATIONS) ?? null : null
    );

    useEffect(() => {
        if (selected) {
            setSelectAnimation(randomElementFromArray(OVER_THE_TOP_ANIMATIONS) ?? null);
        }
    }, [selected]);

    function handleClick() {
        onSelectedChanged(!selected);
    }

    const classColorRGB = `rgb(${hexWithOpacityToRgb(_class.color, 0.6, theme.palette.mode === "dark" ? 0 : 255).join(
        ","
    )})`;

    return (
        <Card
            sx={{
                background: "none",
                position: "relative",
                borderLeft: `0.4rem solid ${classColorRGB}`,
            }}
        >
            <CardContent
                className={"unselectable"}
                onClick={selectable ? handleClick : undefined}
                sx={{ paddingBottom: 1 }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography
                        sx={{
                            fontSize: "1.05rem",
                            ...(selected ? { fontWeight: "bold" } : {}),
                        }}
                    >
                        {_class.name}
                    </Typography>
                    <ClassPopularityMeter popularity={popularity} />
                </Box>
                <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                    {simpleTimeStringFromISO(_class.from)} - {simpleTimeStringFromISO(_class.to)}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                    {_class.studio.name}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                    {_class.instructors.map((i) => i.name).join(", ")}
                </Typography>
            </CardContent>
            <CardActions sx={{ padding: 0 }} disableSpacing>
                <Box sx={{ padding: "0 8px 8px 8px" }}>
                    <IconButton onClick={onInfo} size={"small"}>
                        <InfoOutlinedIcon />
                    </IconButton>
                    {/*{selected && (*/}
                    {/*    <IconButton onClick={onSettings} size={"small"}>*/}
                    {/*        <SettingsOutlinedIcon />*/}
                    {/*    </IconButton>*/}
                    {/*)}*/}
                </Box>
            </CardActions>
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "100%",
                    backgroundColor: theme.palette.mode === "dark" ? "#111" : "white",
                    zIndex: -1,
                }}
            />
            {selectAnimation && (
                <Box
                    className={selectAnimation ? (selected ? selectAnimation.enter : selectAnimation.leave) : ""}
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: "100%",
                        width: "100%",
                        backgroundColor: classColorRGB,
                        zIndex: -1,
                    }}
                />
            )}
        </Card>
    );
};

export default ClassCard;
