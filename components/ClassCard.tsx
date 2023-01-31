import {Box, Button, Card, CardActions, CardContent, Modal, Typography} from "@mui/material";
import React, {useState} from "react";
import Image from "next/image";
import {SitClass} from "../types/sit_types";
import {simpleTimeStringFromISO} from "../utils/time_utils";

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
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    function handleClick() {
        const newSelected = !selected
        setSelected(newSelected)
        onSelectedChanged(newSelected)
    }

    return (
        <Card
            sx={selected ? {backgroundColor: "green"} : {}}
        >
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
                <Button size="small" fullWidth sx={{paddingY: 1, color: "text.secondary"}}
                        onClick={handleOpen}>Info</Button>
            </CardActions>
            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 600,
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography variant="h6" component="h2">
                        {_class.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {simpleTimeStringFromISO(_class.from)} - {simpleTimeStringFromISO(_class.to)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {_class.studio.name}
                    </Typography>
                    {_class.image && <Box pt={2}>
                        <Image src={_class.image} alt={_class.name} width={600} height={300}
                               objectFit={'contain'}></Image>
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