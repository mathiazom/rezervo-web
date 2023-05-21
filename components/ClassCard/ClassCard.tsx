import { Box, Card, CardActions, CardContent, Typography } from "@mui/material";
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

    const classColorRGB = (dark: boolean) => `rgb(${hexWithOpacityToRgb(_class.color, 0.6, dark ? 0 : 255).join(",")})`;

    const isInThePast = new Date(_class.from).getTime() < new Date().getTime();

    return (
        <Card
            sx={{
                opacity: isInThePast ? 0.5 : 1,
                background: "none",
                position: "relative",
                borderLeft: `0.4rem solid ${classColorRGB(false)}`,
                '[data-mui-color-scheme="dark"] &': {
                    borderLeft: `0.4rem solid ${classColorRGB(true)}`,
                },
            }}
        >
            <CardContent
                className={"unselectable"}
                onClick={selectable && !isInThePast ? handleClick : undefined}
                sx={{ paddingBottom: 1 }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography
                        sx={{
                            textDecoration: isInThePast ? "line-through" : "none",
                            fontSize: "1.05rem",
                            ...(selected ? { fontWeight: "bold" } : {}),
                        }}
                    >
                        {_class.name}
                    </Typography>
                    {!isInThePast && <ClassPopularityMeter popularity={popularity} />}
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
                    zIndex: -1,
                    backgroundColor: "white",
                    '[data-mui-color-scheme="dark"] &': {
                        backgroundColor: "#111",
                    },
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
                        zIndex: -1,
                        backgroundColor: classColorRGB(false),
                        '[data-mui-color-scheme="dark"] &': {
                            backgroundColor: classColorRGB(true),
                        },
                    }}
                />
            )}
        </Card>
    );
};

export default ClassCard;
