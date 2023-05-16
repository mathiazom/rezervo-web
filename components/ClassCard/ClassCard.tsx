import {Box, Button, Card, CardActions, CardContent, Typography, useTheme} from "@mui/material";
import React, {useState} from "react";
import {SitClass} from "../../types/sitTypes";
import {simpleTimeStringFromISO} from "../../utils/timeUtils";
import {hexWithOpacityToRgb} from "../../utils/colorUtils";
import {EnterLeaveAnimation, OVER_THE_TOP_ANIMATIONS} from "../../types/animationTypes";
import {randomElementFromArray} from "../../utils/arrayUtils";
import {ActivityPopularity} from "../../types/derivedTypes";
import ClassPopularityMeter from "./ClassPopularityMeter";

const ClassCard = (
    {
        _class,
        activityPopularity,
        onSelectedChanged,
        onInfo,
    }: {
        _class: SitClass,
        activityPopularity: ActivityPopularity,
        // eslint-disable-next-line no-unused-vars
        onSelectedChanged: (selected: boolean) => void,
        onInfo: () => void
    }
) => {

    const [selected, setSelected] = useState(false);

    const theme = useTheme()

    const [selectAnimation, setSelectAnimation] = useState<EnterLeaveAnimation | null>(null);

    function handleClick() {
        const newSelected = !selected
        if (newSelected) {
            setSelectAnimation(randomElementFromArray(OVER_THE_TOP_ANIMATIONS) ?? null)
        }
        setSelected(newSelected)
        onSelectedChanged(newSelected)
    }

    const classColorRGB = `rgb(${hexWithOpacityToRgb(
        _class.color,
        0.6,
        theme.palette.mode === "dark" ? 0 : 255
    ).join(",")})`

    return (
        <Card
            sx={{
                background: "none",
                position: "relative",
                borderLeft: `0.4rem solid ${classColorRGB}`
            }}>
            <CardContent className={"unselectable"} onClick={handleClick} sx={{paddingBottom: 1}}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography
                        sx={{
                            fontSize: "1.05rem",
                            ...(selected ? { fontWeight: "bold" } : {}),
                        }}
                    >
                        {_class.name}
                    </Typography>
                    <ClassPopularityMeter popularity={activityPopularity.popularity} />
                </Box>
                <Typography sx={{fontSize: "0.85rem"}} variant="body2" color="text.secondary">
                    {simpleTimeStringFromISO(_class.from)} - {simpleTimeStringFromISO(_class.to)}
                </Typography>
                <Typography sx={{fontSize: "0.85rem"}} variant="body2" color="text.secondary">
                    {_class.studio.name}
                </Typography>
                <Typography sx={{fontSize: "0.85rem"}} variant="body2" color="text.secondary">
                    {_class.instructors.map((i) => i.name).join(", ")}
                </Typography>
            </CardContent>
            <CardActions sx={{padding: 0}}>
                <Button size="small" fullWidth sx={{
                    paddingY: 1,
                    color: "text.secondary",
                    ':hover': {
                        bgcolor: `${_class.color}10`
                    }
                }}
                        onClick={onInfo}>Info</Button>
            </CardActions>
            <Box sx={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                backgroundColor: theme.palette.mode === "dark" ? "#212121" : "white",
                zIndex: -1
            }}/>
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
                        zIndex: -1
                    }}/>
            )}
        </Card>
    )
}

export default ClassCard
