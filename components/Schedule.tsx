import React, {useEffect, useState} from "react";
import {Box, Modal, Stack, Typography, useTheme} from "@mui/material";
import ClassCard from "./ClassCard/ClassCard";
import {ActivityPopularity, ClassPopularity} from "../types/derivedTypes";
import {SitClass, SitSchedule} from "../types/sitTypes";
import {simpleTimeStringFromISO, weekdayNameToNumber} from "../utils/timeUtils";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import Image from "next/image";
import {hexWithOpacityToRgb} from "../utils/colorUtils";
import {useRouter} from "next/router";
import ClassPopularityMeter from "./ClassCard/ClassPopularityMeter";

const Schedule = (
    {
        schedule,
        previousActivities,
        onSelectedChanged
    }: {
        schedule: SitSchedule,
        previousActivities: ActivityPopularity[],
        // eslint-disable-next-line no-unused-vars
        onSelectedChanged: (classId: string, selected: boolean) => void
    }
) => {
    const router = useRouter()

    const theme = useTheme()

    const [modalClass, setModalClass] = useState<SitClass | null>(null)

    useEffect(() => {
        const { classId } = router.query
        if (classId !== undefined) {
            const linkedClass = schedule.days
                .flatMap((day) => day.classes)
                .find((_class) => _class.id === Number(classId))
            if (linkedClass) {
                setModalClass(linkedClass);
            }
        }
    }, [router.query, schedule.days])

    function colorForClass(_class: SitClass) {
        return `rgb(${hexWithOpacityToRgb(
            _class.color,
            0.6,
            theme.palette.mode === "dark" ? 0 : 255
        ).join(",")})`
    }

    const lookupActivityPopularity = (_class: SitClass): ActivityPopularity => previousActivities.find(
            (activityPopularity) => activityPopularity.activityId ===  _class.activityId)
        ?? {popularity: ClassPopularity.Unknown} as ActivityPopularity

    return (
        <Stack direction={"row"}>
            {schedule.days.map((day) =>
                (
                    <Box key={day.date} width={200} pr={2}>
                        <Box py={2} width={200}>
                            <Typography variant="h6" component="div">
                                {day.dayName}
                            </Typography>
                            <Typography variant="h6" component="div"
                                        style={{color: theme.palette.grey[600], fontSize: 15}}>
                                {day.date}
                            </Typography>
                        </Box>
                        {day.classes.length > 0 ? (
                            day.classes.map((_class) => {
                                _class.weekday = weekdayNameToNumber(day.dayName);
                                return (
                                    <Box key={_class.id} mb={1}>
                                        <ClassCard
                                            _class={_class}
                                            activityPopularity={lookupActivityPopularity(_class)}
                                            onSelectedChanged={(s) => onSelectedChanged(_class.id.toString(), s)}
                                            onInfo={() => setModalClass(_class)}
                                        />
                                    </Box>
                                );
                            })
                        ) : <p>Ingen gruppetimer</p>}
                    </Box>
                ))}
            <Modal
                open={modalClass != null}
                onClose={() => setModalClass(null)}
            >
                <>
                    {modalClass && (
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: "95%",
                            maxHeight: "80%",
                            overflowY: "scroll",
                            maxWidth: 600,
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: theme.palette.mode === "dark" ? "#212121" : "white",
                            borderRadius: "0.25em",
                            boxShadow: 24,
                            p: 4,
                        }}>
                            <Box sx={{display: "flex", alignItems: "center", gap: 1, paddingBottom: 1}}>
                                <Box sx={{
                                    backgroundColor: colorForClass(modalClass),
                                    borderRadius: "50%",
                                    height: "1.5rem",
                                    width: "1.5rem"
                                }}/>
                                <Typography variant="h6" component="h2">
                                    {modalClass.name}
                                </Typography>
                            </Box>
                            <Box sx={{display: "flex", paddingTop: 1, gap: 1, alignItems: "center"}}>
                                <ClassPopularityMeter popularity={lookupActivityPopularity(modalClass).popularity} />
                                <Typography variant="body2" color="text.secondary">
                                    {lookupActivityPopularity(modalClass).popularity}
                                </Typography>
                            </Box>
                            <Box
                                sx={{display: "flex", paddingTop: 1, gap: 1, alignItems: "center"}}>
                                <AccessTimeIcon/>
                                <Typography variant="body2" color="text.secondary">
                                    {simpleTimeStringFromISO(modalClass.from)} - {simpleTimeStringFromISO(modalClass.to)}
                                </Typography>
                            </Box>
                            <Box
                                sx={{display: "flex", paddingTop: 1, gap: 1, alignItems: "center"}}>
                                <LocationOnIcon/>
                                <Typography variant="body2" color="text.secondary">
                                    {modalClass.studio.name}
                                </Typography>
                            </Box>
                            <Box
                                sx={{display: "flex", paddingTop: 1, gap: 1, alignItems: "center"}}>
                                <PersonIcon/>
                                <Typography variant="body2" color="text.secondary">
                                    {modalClass.instructors.map((i) => i.name).join(", ")}
                                </Typography>
                            </Box>
                            {modalClass.image && <Box pt={2}>
                                <Image src={modalClass.image} alt={modalClass.name} width={600}
                                       height={300}
                                       objectFit={'cover'}
                                       style={{borderRadius: "0.25em", padding: 0}}></Image>
                            </Box>}
                            <Typography pt={2}>
                                {modalClass.description}
                            </Typography>
                        </Box>
                    )}
                </>
            </Modal>
        </Stack>
    )
}

export default Schedule
