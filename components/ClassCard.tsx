import {Box, Button, Card, CardActions, CardContent, Modal, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import Image from "next/image";

const ClassCard = (
    {
        _class,
        addClass,
        removeClass
    }: {
        _class: any,
        addClass: (_class: any) => void,
        removeClass: (_class: any) => void
    }
) => {

    const [checked, setChecked] = useState(false)
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        width: 600,
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    const toggleChecked = () => setChecked(!checked)

    useEffect(() => {
        if (checked) {
            addClass(_class)
        } else {
            removeClass(_class)
        }
    }, [checked])

    function timeFromISOString(isoString: string) {
        return isoString.split(' ')[1].slice(0,5)
    }

    return (
        <Card sx={checked ? {backgroundColor: "green"}:{}}>
            <CardContent onClick={toggleChecked} sx={{paddingBottom: 1}}>
                <Typography sx={checked ? {fontWeight: "bold"}:{}}>
                    {_class.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {timeFromISOString(_class.from)} - {timeFromISOString(_class.to)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {_class.studio.name}
                </Typography>
            </CardContent>
            <CardActions sx={{padding:0}}>
                <Button size="small" fullWidth sx={{paddingY:1, color:"text.secondary"}} onClick={handleOpen}>Info</Button>
            </CardActions>
            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box sx={style}>
                    <Typography variant="h6" component="h2">
                        {_class.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {timeFromISOString(_class.from)} - {timeFromISOString(_class.to)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {_class.studio.name}
                    </Typography>
                    {_class.image && <Box pt={2}>
                        <Image src={_class.image} alt={_class.name} width={600} height={300} objectFit={'contain'}></Image>
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