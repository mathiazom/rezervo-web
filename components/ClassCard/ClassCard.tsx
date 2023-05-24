import { Avatar, AvatarGroup, Box, Card, CardActions, CardContent, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { SitClass } from "../../types/sitTypes";
import { simpleTimeStringFromISO } from "../../utils/timeUtils";
import { hexColorHash, hexWithOpacityToRgb } from "../../utils/colorUtils";
import { EnterLeaveAnimation, OVER_THE_TOP_ANIMATIONS } from "../../types/animationTypes";
import { randomElementFromArray } from "../../utils/arrayUtils";
import IconButton from "@mui/material/IconButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ClassPopularity } from "../../types/derivedTypes";
import ClassPopularityMeter from "./ClassPopularityMeter";
import { DateTime } from "luxon";
import { SIT_TIMEZONE } from "../../config/config";

const ClassCard = ({
    _class,
    popularity,
    peers,
    selectable,
    selected,
    onSelectedChanged,
    onInfo,
}: // onSettings,
{
    _class: SitClass;
    popularity: ClassPopularity;
    peers: string[];
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

    const isInThePast = DateTime.fromISO(_class.from, { zone: SIT_TIMEZONE }) < DateTime.now();

    return (
        <Card
            sx={{
                opacity: isInThePast ? 0.6 : 1,
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
                <Box px={1.75} pt={0.5} pb={2} sx={{ width: "100%" }}>
                    <Box sx={{ display: "flex" }}>
                        <IconButton onClick={onInfo} size={"small"} sx={{ padding: 0 }}>
                            <InfoOutlinedIcon />
                        </IconButton>
                        {/*{selected && (*/}
                        {/*    <IconButton onClick={onSettings} size={"small"}>*/}
                        {/*        <SettingsOutlinedIcon />*/}
                        {/*    </IconButton>*/}
                        {/*)}*/}
                        {peers.length > 0 && (
                            <AvatarGroup
                                max={4}
                                sx={{
                                    justifyContent: "start",
                                    marginLeft: "auto",
                                    "& .MuiAvatar-root": { width: 24, height: 24, fontSize: 12, border: "none" },
                                }}
                            >
                                {peers.map((p) => (
                                    <Avatar key={p} alt={p} sx={{ backgroundColor: hexColorHash(p) }}>
                                        {p[0]}
                                    </Avatar>
                                ))}
                            </AvatarGroup>
                        )}
                    </Box>
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
                        backgroundColor: "#191919",
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
