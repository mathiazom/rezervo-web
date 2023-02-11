import {Box, Button, Card, CardActions, CardContent, Modal, Typography, useTheme} from "@mui/material";
import React, {useState} from "react";
import Image from "next/image";
import {SitClass} from "../../types/sitTypes";
import {simpleTimeStringFromISO} from "../../utils/timeUtils";
import {hexWithOpacityToRgb} from "../../utils/colorUtils";
import {EnterLeaveAnimation, OVER_THE_TOP_ANIMATIONS} from "../../types/animationTypes";
import {randomElementFromArray} from "../../utils/arrayUtils";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const ClassCard = (
    {
        _class,
        onSelectedChanged
    }: {
        _class: SitClass,
        onSelectedChanged: (selected: boolean) => void
    }
) => {

    const [selected, setSelected] = useState(false);
    const [open, setOpen] = useState(false);

    const theme = useTheme()

    const [selectAnimation, setSelectAnimation] = useState<EnterLeaveAnimation | null>(null);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    function handleClick() {
        const newSelected = !selected
        if (newSelected) {
            setSelectAnimation(randomElementFromArray(OVER_THE_TOP_ANIMATIONS))
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
                <Typography
                    sx={selected ? {fontWeight: "bold"} : {}}
                >
                    {_class.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {simpleTimeStringFromISO(_class.from)} - {simpleTimeStringFromISO(_class.to)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {_class.studio.name}
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
                        onClick={handleOpen}>Info</Button>
            </CardActions>
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
            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: "95%",
                    maxHeight: "80%",
                    overflow: "scroll",
                    maxWidth: 600,
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    borderRadius: "0.25em",
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography variant="h6" component="h2">
                        {_class.name}
                    </Typography>
                    <Box sx={{display: "flex", paddingTop: 1, gap: 1, alignItems: "center"}}>
                        <AccessTimeIcon/>
                        <Typography variant="body2" color="text.secondary">
                            {simpleTimeStringFromISO(_class.from)} - {simpleTimeStringFromISO(_class.to)}
                        </Typography>
                    </Box>
                    <Box sx={{display: "flex", paddingTop: 1, gap: 1, alignItems: "center"}}>
                        <LocationOnIcon/>
                        <Typography variant="body2" color="text.secondary">
                            {_class.studio.name}
                        </Typography>
                    </Box>
                    <Box sx={{display: "flex", paddingTop: 1, gap: 1, alignItems: "center"}}>
                        <PersonIcon/>
                        <Typography variant="body2" color="text.secondary">
                            {_class.instructors.map((i) => i.name).join(", ")}
                        </Typography>
                    </Box>
                    {_class.image && <Box pt={2}>
                        <Image src={_class.image} alt={_class.name} width={600} height={300}
                               objectFit={'cover'} style={{borderRadius: "0.25em", padding: 0}}></Image>
                    </Box>}
                    <Typography pt={2}>
                        {_class.description}
                    </Typography>
                </Box>
            </Modal>
        </Card>
    )
}

export default ClassCard
